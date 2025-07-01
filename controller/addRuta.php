<?php
require_once '../includes/dbConnection.php';

header('Content-Type: application/json');

try {
    // Validar que todos los campos requeridos estén presentes
    if (!isset($_POST['nombre'], $_POST['descripcion'], $_POST['hora_inicio'], $_POST['hora_fin'], $_POST['estado'], $_POST['ubicaciones'])) {
        throw new Exception('Faltan campos requeridos en la solicitud');
    }

    // Verificar si el nombre de ruta ya existe
    $stmtCheck = $connection->prepare("SELECT COUNT(*) FROM rondin WHERE nombre = :nombre");
    $stmtCheck->execute([':nombre' => $_POST['nombre']]);
    $exists = $stmtCheck->fetchColumn();

    if ($exists > 0) {
        throw new Exception('Ya existe una ruta con este nombre');
    }

    // Validar que haya al menos una ubicación
    $ubicaciones = json_decode($_POST['ubicaciones'], true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Error al decodificar las ubicaciones: ' . json_last_error_msg());
    }
    
    if (count($ubicaciones) === 0) {
        throw new Exception('Debe seleccionar al menos una ubicación');
    }

    // Iniciar transacción
    $connection->beginTransaction();
    
    // 1. Insertar datos principales del rondín
    $stmt = $connection->prepare("INSERT INTO rondin (nombre, descripcion, hora_inicio, hora_fin, estado) VALUES (:nombre, :descripcion, :hora_inicio, :hora_fin, :estado)");
    $stmt->execute([
        ':nombre' => $_POST['nombre'],
        ':descripcion' => $_POST['descripcion'],
        ':hora_inicio' => $_POST['hora_inicio'],
        ':hora_fin' => $_POST['hora_fin'],
        ':estado' => $_POST['estado']
    ]);
    $rondinId = $connection->lastInsertId();
    
    // 2. Procesar ubicaciones
    $stmt = $connection->prepare("INSERT INTO rutas_rondin (rondin_id, ubicacion_id, orden) VALUES (:rondin_id, :ubicacion_id, :orden)");
    
    foreach ($ubicaciones as $ubicacion) {
        if (!isset($ubicacion['id'], $ubicacion['orden'])) {
            throw new Exception('Formato de ubicación incorrecto');
        }
        $stmt->execute([
            ':rondin_id' => $rondinId,
            ':ubicacion_id' => $ubicacion['id'],
            ':orden' => $ubicacion['orden']
        ]);
    }
    
    // Confirmar transacción
    $connection->commit();
    
    echo json_encode([
        'success' => true, 
        'message' => 'Ruta creada exitosamente',
        'rondin_id' => $rondinId
    ]);
    
} catch (PDOException $e) {
    if (isset($connection) && $connection->inTransaction()) {
        $connection->rollBack();
    }
    echo json_encode([
        'success' => false, 
        'message' => 'Error en la base de datos: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    if (isset($connection) && $connection->inTransaction()) {
        $connection->rollBack();
    }
    echo json_encode([
        'success' => false, 
        'message' => $e->getMessage()
    ]);
}
?>