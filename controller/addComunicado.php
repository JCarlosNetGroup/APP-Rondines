<?php
session_start();
require_once '../includes/dbConnection.php';

header('Content-Type: application/json');

try {
    // Validar campos requeridos
    if (empty($_POST['titulo']) || empty($_POST['contenido']) || empty($_POST['fecha_expiracion'])) {
        throw new Exception('Todos los campos son requeridos');
    }

    // Verificar empleado_id en sesión
    if (!isset($_SESSION['empleado_id'])) {
        throw new Exception('No autorizado');
    }-


    $connection->beginTransaction();

    // Insertar en la base de datos con todos los campos
    $sql = "INSERT INTO comunicados 
             (titulo, contenido, empleado_id, 
              fecha_publicacion, fecha_expiracion, prioridad, fecha_actualizacion) 
             VALUES 
             (:titulo, :contenido, :empleado_id, 
              NOW(), :fecha_expiracion_db, :prioridad, NOW())";

    $stmt = $connection->prepare($sql);
    $stmt->execute([
        'titulo' => $_POST['titulo'],
        'contenido' => $_POST['contenido'],
        'empleado_id' => $_SESSION['empleado_id'],
        'fecha_expiracion_db' => $_POST['fecha_expiracion'],
        'prioridad' => $_POST['prioridad'] ?? 'medio'
    ]);

    $connection->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Comunicado publicado correctamente',
        'newId' => $connection->lastInsertId()
    ]);

} catch (Exception $e) {
    if ($connection->inTransaction()) {
        $connection->rollBack();
    }

    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$connection = null;
?>