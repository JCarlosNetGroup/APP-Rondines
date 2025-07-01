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
    }

    // --- CAMBIO AQUÍ ---
    // Validar fecha de expiración
    $fechaExpiracion = new DateTime($_POST['fecha_expiracion'] . ' 23:59:59'); // Establecer al final del día
    $fechaActual = new DateTime();
    $fechaActual->setTime(0, 0, 0); // Establecer 'hoy' al inicio del día (00:00:00)
    
    if ($fechaExpiracion < $fechaActual) {
        throw new Exception('La fecha de expiración no puede ser anterior a la fecha actual');
    }
    // --- FIN CAMBIO ---

    $connection->beginTransaction();

    // Insertar en la base de datos con todos los campos
    $sql = "INSERT INTO comunicados 
             (titulo, contenido, empleado_id, 
              fecha_publicacion, fecha_expiracion, prioridad, fecha_actualizacion) 
             VALUES 
             (:titulo, :contenido, :empleado_id, 
              NOW(), :fecha_expiracion, :prioridad, NOW())";
    
    $stmt = $connection->prepare($sql);
    $stmt->execute([
        'titulo' => $_POST['titulo'],
        'contenido' => $_POST['contenido'],
        'empleado_id' => $_SESSION['empleado_id'],
        'fecha_expiracion' => $_POST['fecha_expiracion'],
        'prioridad' => $_POST['prioridad'] ?? 'Medio'
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