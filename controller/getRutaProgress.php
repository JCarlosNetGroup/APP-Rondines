<?php
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");
header('Content-Type: application/json');

require_once '../includes/dbConnection.php';
require_once '../controller/ValidarSesion.php';

try {
    $rondinId = $_GET['id_rondin'] ?? null;
    $cycleId = $_GET['cycle_id'] ?? null;
    $empleadoId = $_SESSION['empleado_id'] ?? null;

    if (!$rondinId || $cycleId === null || !$empleadoId) {
        throw new Exception('Se requieren ID de rondín, ID de ciclo y ID de empleado.');
    }

    // 1. Obtener el total de ubicaciones del rondín
    $queryTotal = "SELECT COUNT(*) FROM rutas_rondin WHERE rondin_id = ?";
    $stmtTotal = $connection->prepare($queryTotal);
    $stmtTotal->execute([$rondinId]);
    $totalUbicaciones = $stmtTotal->fetchColumn();

    // 2. Obtener ubicaciones escaneadas con estatus 'Completado'
    $queryEscaneadas = "
        SELECT DISTINCT ubicacion_id
        FROM reporte
        WHERE rondin_id = ?
        AND empleado_id = ?
        AND ciclo_id = ?
        AND estatus = 'Completado'
        AND ubicacion_id IS NOT NULL";
    $stmtEscaneadas = $connection->prepare($queryEscaneadas);
    $stmtEscaneadas->execute([$rondinId, $empleadoId, $cycleId]);
    $ubicacionesEscaneadas = $stmtEscaneadas->fetchAll(PDO::FETCH_COLUMN);

    // Convertir IDs a strings y filtrar valores nulos
    $ubicacionesEscaneadas = array_filter(array_map('strval', $ubicacionesEscaneadas));

    echo json_encode([
        'success' => true,
        'totalUbicaciones' => (int)$totalUbicaciones,
        'ubicacionesEscaneadas' => array_values($ubicacionesEscaneadas),
        'porcentajeCompletado' => $totalUbicaciones > 0
            ? round((count($ubicacionesEscaneadas) / $totalUbicaciones) * 100)
            : 0
    ]);

} catch (Exception $e) {
    http_response_code(400);
    error_log("Error en getRutaProgress.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'totalUbicaciones' => 0,
        'ubicacionesEscaneadas' => [],
        'porcentajeCompletado' => 0
    ]);
}
?>