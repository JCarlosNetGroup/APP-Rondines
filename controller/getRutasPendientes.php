<?php
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");
header('Content-Type: application/json');

require_once '../includes/dbConnection.php';
require_once '../controller/ValidarSesion.php';

set_time_limit(30);
ini_set('memory_limit', '128M');

try {
    $empleadoId = $_SESSION['empleado_id'] ?? null;
    if (!$empleadoId) {
        throw new Exception('No se pudo obtener el ID del empleado de la sesión.');
    }

    // 1. Obtenemos el ciclo más reciente del usuario logueado
    $queryCicloReciente = "SELECT MAX(ciclo_id) as max_ciclo FROM reporte 
                          WHERE empleado_id = :empleadoId AND ciclo_id > 0";
    $stmtCiclo = $connection->prepare($queryCicloReciente);
    $stmtCiclo->bindParam(':empleadoId', $empleadoId, PDO::PARAM_INT);
    $stmtCiclo->execute();
    
    $cicloData = $stmtCiclo->fetch(PDO::FETCH_ASSOC);
    $maxCiclo = $cicloData['max_ciclo'] ?? 0;
    $stmtCiclo->closeCursor();

    // 2. Consulta principal filtrando solo los datos del usuario logueado
    $query = "SELECT
        r.id_rondin,
        r.nombre,
        r.descripcion,
        r.estado,
        DATE_FORMAT(r.hora_inicio, '%H:%i') as hora_inicio,
        DATE_FORMAT(r.hora_fin, '%H:%i') as hora_fin,
        rep.ciclo_id,
        (
            SELECT COUNT(*) 
            FROM rutas_rondin rr 
            WHERE rr.rondin_id = r.id_rondin
        ) as total_ubicaciones,
        (
            SELECT COUNT(DISTINCT rep2.ubicacion_id)
            FROM reporte rep2
            WHERE rep2.rondin_id = r.id_rondin
            AND rep2.empleado_id = :empleadoId
            AND rep2.ciclo_id = rep.ciclo_id
            AND rep2.estatus = 'Completado'
        ) as ubicaciones_escaneadas,
        (
            SELECT MAX(rep3.fecha) 
            FROM reporte rep3
            WHERE rep3.ciclo_id = rep.ciclo_id
            AND rep3.empleado_id = :empleadoId
            LIMIT 1
        ) as fecha_ciclo
    FROM rondin r
    JOIN reporte rep ON rep.rondin_id = r.id_rondin 
    WHERE r.estado = 'Activa'
    AND rep.empleado_id = :empleadoId
    AND rep.ciclo_id > 0
    AND rep.ciclo_id < :maxCiclo
    GROUP BY r.id_rondin, rep.ciclo_id";

    $stmt = $connection->prepare($query);
    $stmt->bindParam(':empleadoId', $empleadoId, PDO::PARAM_INT);
    $stmt->bindParam(':maxCiclo', $maxCiclo, PDO::PARAM_INT);
    
    if (!$stmt->execute()) {
        $errorInfo = $stmt->errorInfo();
        throw new Exception("Error en la consulta: " . $errorInfo[2]);
    }
    
    $rutas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $stmt->closeCursor();

    if (empty($rutas)) {
        echo json_encode([
            'success' => true,
            'message' => 'No hay rutas pendientes para este usuario',
            'rutas' => []
        ]);
        exit;
    }

    // Filtrar solo las rutas pendientes del usuario
    $rutasPendientes = [];
    foreach ($rutas as $ruta) {
        $totalUbicaciones = (int)$ruta['total_ubicaciones'];
        $ubicacionesEscaneadas = (int)$ruta['ubicaciones_escaneadas'];
        
        if ($totalUbicaciones > 0 && $ubicacionesEscaneadas < $totalUbicaciones) {
            $ruta['estado_ruta'] = 'Pendientes';
            $ruta['nombre_ciclo'] = 'Ciclo ' . $ruta['ciclo_id'];
            $rutasPendientes[] = $ruta;
        }
    }

    // Ordenar por fecha del ciclo (más antiguos primero)
    usort($rutasPendientes, function($a, $b) {
        return strtotime($a['fecha_ciclo']) - strtotime($b['fecha_ciclo']);
    });

    echo json_encode([
        'success' => true,
        'rutas' => $rutasPendientes
    ]);

} catch (PDOException $e) {
    error_log("Error en getRutasPendientes.php (PDO): " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error al cargar las rutas. Por favor, intente más tarde.',
        'error' => $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("Error en getRutasPendientes.php (General): " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Ocurrió un error inesperado.',
        'error' => $e->getMessage()
    ]);
}
?>