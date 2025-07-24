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
    // Obtener parámetros de filtrado
    $searchTerm = isset($_GET['search']) ? $_GET['search'] : '';
    $estadoFiltro = isset($_GET['estado']) ? $_GET['estado'] : '';
    $searchWords = $searchTerm ? explode(' ', $searchTerm) : [];

    // Validar empleado_id de la sesión
    $empleadoId = $_SESSION['empleado_id'] ?? null;
    if (!$empleadoId) {
        throw new Exception('No se pudo obtener el ID del empleado de la sesión.');
    }

    // Consulta principal con subconsultas mejoradas
    $query = "SELECT
        r.id_rondin,
        r.nombre,
        r.descripcion,
        r.estado,
        DATE_FORMAT(r.hora_inicio, '%H:%i') as hora_inicio,
        DATE_FORMAT(r.hora_fin, '%H:%i') as hora_fin,
        (
            SELECT COALESCE(MAX(rep.ciclo_id), 0)
            FROM reporte rep
            WHERE rep.rondin_id = r.id_rondin
            AND rep.empleado_id = :empleadoId
            AND rep.ciclo_id > 0
        ) AS current_cycle_id,
        (
            SELECT COUNT(*) 
            FROM rutas_rondin rr 
            WHERE rr.rondin_id = r.id_rondin
        ) as total_ubicaciones,
        (
            SELECT COUNT(DISTINCT rep.ubicacion_id)
            FROM reporte rep
            WHERE rep.rondin_id = r.id_rondin
            AND rep.empleado_id = :empleadoId
            AND rep.ciclo_id = (
                SELECT COALESCE(MAX(inner_rep.ciclo_id), 0)
                FROM reporte inner_rep
                WHERE inner_rep.rondin_id = r.id_rondin
                AND inner_rep.empleado_id = :empleadoId
                AND inner_rep.ciclo_id > 0
            )
            AND rep.estatus = 'Completado'  -- Filtro crucial añadido
        ) as ubicaciones_escaneadas
    FROM rondin r";

    // Array para condiciones WHERE
    $conditions = [];

    // Filtro de estado
    if ($estadoFiltro === '' && !isset($_GET['estado'])) {
        $conditions[] = "r.estado = 'Activa'";
    } elseif ($estadoFiltro !== '') {
        $conditions[] = "r.estado = :estadoFiltro";
    }

    // Búsqueda por término
    if (!empty($searchWords)) {
        $searchConditions = [];
        foreach ($searchWords as $index => $word) {
            $param = ":searchWord{$index}";
            $searchConditions[] = "(r.nombre LIKE {$param} OR r.descripcion LIKE {$param} OR r.estado LIKE {$param})";
            $searchWords[$index] = "%{$word}%";
        }
        $conditions[] = "(" . implode(' AND ', $searchConditions) . ")";
    }

    // Aplicar condiciones WHERE si existen
    if (!empty($conditions)) {
        $query .= " WHERE " . implode(' AND ', $conditions);
    }
    
    // Ordenamiento consistente
    $query .= " ORDER BY r.nombre ASC";

    $stmt = $connection->prepare($query);

    // Bind parameters
    $stmt->bindParam(':empleadoId', $empleadoId, PDO::PARAM_INT);
    $stmt->bindParam(':empleadoId', $empleadoId, PDO::PARAM_INT);
    $stmt->bindParam(':empleadoId', $empleadoId, PDO::PARAM_INT);
    $stmt->bindParam(':empleadoId', $empleadoId, PDO::PARAM_INT);

    if ($estadoFiltro !== '' && isset($_GET['estado'])) {
        $stmt->bindParam(':estadoFiltro', $estadoFiltro, PDO::PARAM_STR);
    }

    if (!empty($searchWords)) {
        foreach ($searchWords as $index => $word) {
            $stmt->bindValue(":searchWord{$index}", $word, PDO::PARAM_STR);
        }
    }

    $stmt->execute();
    $rutas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $stmt->closeCursor();

    if (empty($rutas)) {
        echo json_encode([
            'success' => true,
            'message' => 'No hay rutas registradas',
            'rutas' => []
        ]);
        exit;
    }

    // Lógica mejorada para asignar estado_ruta
    foreach ($rutas as &$ruta) {
        $totalUbicaciones = (int)$ruta['total_ubicaciones'];
        $ubicacionesEscaneadas = (int)$ruta['ubicaciones_escaneadas'];
        $currentCycleId = (int)$ruta['current_cycle_id']; 
        
        if ($totalUbicaciones === 0) {
            $ruta['estado_ruta'] = 'Sin Ubicaciones';
            $ruta['current_cycle_id'] = 0;
            $ruta['ubicaciones_escaneadas'] = 0;
        } elseif ($currentCycleId === 0) {
            $ruta['estado_ruta'] = 'Nuevo';
            $ruta['ubicaciones_escaneadas'] = 0;
        } elseif ($ubicacionesEscaneadas >= $totalUbicaciones && $totalUbicaciones > 0) {
            $ruta['estado_ruta'] = 'Completado';
        } elseif ($ubicacionesEscaneadas > 0 || $currentCycleId > 0) {
            // Considerar como pendiente si hay al menos un escaneo o si hay un ciclo iniciado
            $ruta['estado_ruta'] = 'Pendientes';
        } else {
            // Caso por defecto
            $ruta['estado_ruta'] = 'Nuevo';
        }
    }
    unset($ruta);

    echo json_encode([
        'success' => true,
        'rutas' => $rutas
    ]);

} catch (PDOException $e) {
    error_log("Error en getRutas.php (PDO): " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error al cargar las rutas. Por favor, intente más tarde.',
        'error' => $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("Error en getRutas.php (General): " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Ocurrió un error inesperado.',
        'error' => $e->getMessage()
    ]);
}
?>