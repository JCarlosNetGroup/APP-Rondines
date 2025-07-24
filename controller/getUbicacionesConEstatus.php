<?php
header("Content-Type: application/json");
require_once '../includes/dbConnection.php';
require_once '../controller/ValidarSesion.php';

try {
    // Verificar que el empleado_id esté en la sesión
    $empleadoId = $_SESSION['empleado_id'] ?? null;
    if (!$empleadoId) {
        throw new Exception('Sesión de empleado no válida. Por favor, inicie sesión.');
    }

    // Obtener el ID del rondín y el ID del ciclo de la solicitud GET
    $rondinId = $_GET['id_rondin'] ?? null;
    $cycleId = $_GET['cycle_id'] ?? null;

    if (!$rondinId || !$cycleId) {
        throw new Exception('ID de rondín o ID de ciclo no proporcionado.');
    }

    // Consulta para obtener todas las ubicaciones del rondín
    // y el estatus de su reporte para el ciclo actual (si existe)
    $query = "SELECT
                u.id_ubicacion AS id,
                u.nombre AS nombre,
                u.descripcion AS descripcion,
                u.latitud,  -- Incluye latitud y longitud si existen en tu tabla ubicacion
                u.longitud, -- Esto puede ser útil si quieres mostrar la ubicación en un mapa, por ejemplo
                rr.orden,
                COALESCE(rep.estatus, 'Pendiente') AS estatus_reporte, -- Obtiene el estatus o 'Pendiente' si no hay registro
                CASE WHEN rep.estatus = 'Completado' THEN 1 ELSE 0 END AS escaneada -- Un flag simple para el JS
              FROM rutas_rondin rr
              JOIN ubicacion u ON rr.ubicacion_id = u.id_ubicacion
              LEFT JOIN reporte rep ON rep.rondin_id = rr.rondin_id
                                    AND rep.ubicacion_id = rr.ubicacion_id
                                    AND rep.empleado_id = :empleadoId
                                    AND rep.ciclo_id = :cycleId
              WHERE rr.rondin_id = :rondinId
              ORDER BY rr.orden"; // Ordena las ubicaciones según la ruta definida

    $stmt = $connection->prepare($query);
    $stmt->bindParam(':rondinId', $rondinId, PDO::PARAM_INT);
    $stmt->bindParam(':empleadoId', $empleadoId, PDO::PARAM_INT);
    $stmt->bindParam(':cycleId', $cycleId, PDO::PARAM_STR); // cycle_id es BIGINT, pero PDO::PARAM_STR funciona para números grandes
    $stmt->execute();
    
    $ubicaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'ubicaciones' => $ubicaciones
    ]);

} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener ubicaciones con estatus: ' . $e->getMessage()
    ]);
}
?>