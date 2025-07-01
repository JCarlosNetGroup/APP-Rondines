<?php
require_once '../includes/dbConnection.php';

header('Content-Type: application/json');

try {
    // Validar campos requeridos
    if (!isset($_POST['id'], $_POST['nombre'], $_POST['descripcion'], $_POST['hora_inicio'], $_POST['hora_fin'], $_POST['estado'], $_POST['ubicaciones'])) {
        throw new Exception('Faltan campos requeridos en la solicitud');
    }

    $id = $_POST['id'];
    $nombre = $_POST['nombre'];
    $descripcion = $_POST['descripcion'];
    $hora_inicio = $_POST['hora_inicio'];
    $hora_fin = $_POST['hora_fin'];
    $estado = $_POST['estado'];
    $ubicaciones_json = $_POST['ubicaciones'];

    // Verificar si el nombre de ruta ya existe en otros registros
    $stmtCheck = $connection->prepare("SELECT COUNT(*) FROM rondin WHERE nombre = :nombre AND id_rondin != :id");
    $stmtCheck->execute([
        ':nombre' => $nombre,
        ':id' => $id
    ]);
    $exists = $stmtCheck->fetchColumn();

    if ($exists > 0) {
        throw new Exception('Ya existe otra ruta con este nombre');
    }

    // Validar ubicaciones
    $ubicaciones = json_decode($ubicaciones_json, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Error al decodificar las ubicaciones: ' . json_last_error_msg());
    }
    
    if (count($ubicaciones) === 0) {
        throw new Exception('Debe seleccionar al menos una ubicación');
    }

    $connection->beginTransaction();

    // Actualizar datos básicos de la ruta
    $stmt = $connection->prepare("UPDATE rondin SET nombre = ?, descripcion = ?, hora_inicio = ?, hora_fin = ?, estado = ? WHERE id_rondin = ?");
    $stmt->execute([$nombre, $descripcion, $hora_inicio, $hora_fin, $estado, $id]);

    // Eliminar relaciones anteriores
    $stmt = $connection->prepare("DELETE FROM rutas_rondin WHERE rondin_id = ?");
    $stmt->execute([$id]);

    // Insertar nuevas relaciones
    $stmt = $connection->prepare("INSERT INTO rutas_rondin (rondin_id, ubicacion_id, orden) VALUES (?, ?, ?)");
    foreach($ubicaciones as $ubicacion) {
        if (!isset($ubicacion['id'], $ubicacion['orden'])) {
            throw new Exception('Formato de ubicación incorrecto');
        }
        $stmt->execute([$id, $ubicacion['id'], $ubicacion['orden']]);
    }
    
    $connection->commit();
    
    echo json_encode(['success' => true, 'message' => 'Ruta actualizada correctamente']);
    
} catch (PDOException $e) {
    if (isset($connection) && $connection->inTransaction()) {
        $connection->rollBack();
    }
    echo json_encode(['success' => false, 'message' => 'Error al actualizar: ' . $e->getMessage()]);
} catch (Exception $e) {
    if (isset($connection) && $connection->inTransaction()) {
        $connection->rollBack();
    }
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>