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

    // Obtener el ID del rondín de la solicitud POST
    $rondinId = $_POST['id_rondin'] ?? null;
    if (!$rondinId) {
        throw new Exception('ID de rondín no proporcionado.');
    }

    // Generar un nuevo ciclo_id único usando el timestamp actual en milisegundos
    // Redondeamos para asegurar que sea un número entero, compatible con BIGINT
    $newCycleId = round(microtime(true) * 1000);

    // 1. Obtener todas las ubicaciones asociadas a este rondín
    $queryUbicaciones = "SELECT ubicacion_id FROM rutas_rondin WHERE rondin_id = ?";
    $stmtUbicaciones = $connection->prepare($queryUbicaciones);
    $stmtUbicaciones->execute([$rondinId]);
    $ubicaciones = $stmtUbicaciones->fetchAll(PDO::FETCH_COLUMN); // Obtiene solo los ubicacion_id

    if (empty($ubicaciones)) {
        throw new Exception('El rondín seleccionado no tiene ubicaciones asignadas.');
    }

    // Iniciar una transacción para asegurar que todas las inserciones se completen o ninguna
    $connection->beginTransaction();

    // 2. Pre-insertar un registro en la tabla 'reporte' para cada ubicación
    // con el nuevo ciclo_id y el estatus 'Pendiente'
    $queryInsertReporte = "INSERT INTO reporte
                           (rondin_id, ubicacion_id, empleado_id, ciclo_id, fecha, estatus, observacion, imagen, fecha_escaneo)
                           VALUES (?, ?, ?, ?, NOW(), 'Pendiente', NULL, NULL, NULL)";
    $stmtInsertReporte = $connection->prepare($queryInsertReporte);

    foreach ($ubicaciones as $ubicacionId) {
        // Ejecutar la inserción para cada ubicación
        $stmtInsertReporte->execute([$rondinId, $ubicacionId, $empleadoId, $newCycleId]);
    }

    // Confirmar la transacción si todo fue exitoso
    $connection->commit();

    // Devolver el nuevo ciclo_id al frontend
    echo json_encode([
        'success' => true,
        'message' => 'Ciclo de rondín iniciado y registros pre-poblados exitosamente.',
        'new_cycle_id' => $newCycleId
    ]);

} catch (Exception $e) {
    // Si algo sale mal, revertir la transacción para evitar registros parciales
    if ($connection->inTransaction()) {
        $connection->rollBack();
    }
    http_response_code(500); // Internal Server Error
    echo json_encode([
        'success' => false,
        'message' => 'Error al iniciar el ciclo de rondín: ' . $e->getMessage()
    ]);
}
?>