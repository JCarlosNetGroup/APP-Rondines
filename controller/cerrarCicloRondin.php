<?php
header("Content-Type: application/json");
require_once '../includes/dbConnection.php';
require_once '../controller/ValidarSesion.php';

try {
    // Verificar sesión de empleado
    $empleadoId = $_SESSION['empleado_id'] ?? null;
    if (!$empleadoId) {
        throw new Exception('Sesión de empleado no válida. Por favor, inicie sesión.');
    }

    // Obtener datos de la solicitud
    $rondinId = $_POST['id_rondin'] ?? null;
    $cycleId = $_POST['cycle_id'] ?? null;
    $motivoCierre = $_POST['motivo_cierre'] ?? '';

    // Validaciones
    if (!$rondinId || !$cycleId) {
        throw new Exception('Datos incompletos. Se requieren ID de rondín y ciclo.');
    }

    if (empty(trim($motivoCierre))) {
        throw new Exception('Debe proporcionar un motivo para cerrar el rondín.');
    }

    // Iniciar transacción
    $connection->beginTransaction();

    // Actualizar registros de reporte
    $queryUpdate = "UPDATE reporte 
                   SET estatus = 'Cerrado',
                       observacion = CONCAT(IFNULL(observacion, ''), ?),
                       fecha_escaneo = NOW()
                   WHERE rondin_id = ? 
                   AND ciclo_id = ? 
                   AND estatus = 'Pendiente'";

    $stmtUpdate = $connection->prepare($queryUpdate);
    $stmtUpdate->execute([$motivoCierre, $rondinId, $cycleId]);

    // Verificar si se actualizaron registros
    $rowCount = $stmtUpdate->rowCount();
    if ($rowCount === 0) {
        throw new Exception('No se encontraron registros pendientes para cerrar o ya están cerrados.');
    }

    // Confirmar transacción
    $connection->commit();

    // Respuesta exitosa
    echo json_encode([
        'success' => true,
        'message' => 'Ciclo de rondín cerrado exitosamente.',
        'records_updated' => $rowCount,
        'cycle_id' => $cycleId
    ]);

} catch (Exception $e) {
    // Revertir en caso de error
    if ($connection->inTransaction()) {
        $connection->rollBack();
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al cerrar el ciclo de rondín: ' . $e->getMessage(),
        'error_details' => $connection->errorInfo() // Solo para desarrollo, quitar en producción
    ]);
}
?>