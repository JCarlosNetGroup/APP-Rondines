<?php
session_start();
require_once '../includes/dbConnection.php';

header('Content-Type: application/json');

try {
    // Validar campos requeridos
    if (empty($_POST['id_comunicado'])) {
        throw new Exception('ID de comunicado es requerido para la actualización.');
    }

    // Verificar empleado_id en sesión
    if (!isset($_SESSION['empleado_id'])) {
        throw new Exception('No autorizado para editar comunicados.');
    }

    // Obtener información del comunicado para verificar el autor
    $sqlCheck = "SELECT empleado_id FROM comunicados WHERE id_comunicado = :id_comunicado";
    $stmtCheck = $connection->prepare($sqlCheck);
    $stmtCheck->execute(['id_comunicado' => $_POST['id_comunicado']]);
    $comunicado = $stmtCheck->fetch(PDO::FETCH_ASSOC);

    if (!$comunicado) {
        throw new Exception('Comunicado no encontrado.');
    }

    // Verificar que el empleado que intenta editar es el autor
    if ($comunicado['empleado_id'] != $_SESSION['empleado_id']) {
        throw new Exception('Solo el autor del comunicado puede editarlo.');
    }

    // Validar campos de actualización
    if (empty($_POST['titulo']) || empty($_POST['contenido']) || empty($_POST['fecha_expiracion']) || empty($_POST['prioridad'])) {
        throw new Exception('Todos los campos son requeridos para la actualización.');
    }


    $connection->beginTransaction();

    $sql = "UPDATE comunicados SET
                titulo = :titulo,
                contenido = :contenido,
                fecha_expiracion = :fecha_expiracion,
                prioridad = :prioridad,
                fecha_actualizacion = NOW()
            WHERE id_comunicado = :id_comunicado";

    $stmt = $connection->prepare($sql);
    $stmt->execute([
        'id_comunicado' => $_POST['id_comunicado'],
        'titulo' => $_POST['titulo'],
        'contenido' => $_POST['contenido'],
        'fecha_expiracion' => $_POST['fecha_expiracion'], 
        'prioridad' => $_POST['prioridad'],
    ]);

    if ($stmt->rowCount() === 0) {
        throw new Exception('No se encontró el comunicado para actualizar o no hubo cambios en los datos.');
    }

    $connection->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Comunicado actualizado correctamente'
    ]);

} catch (Exception $e) {
    if ($connection->inTransaction()) {
        $connection->rollBack();
    }

    echo json_encode([
        'success' => false,
        'message' => 'Error al actualizar: ' . $e->getMessage()
    ]);
}

$connection = null;
?>