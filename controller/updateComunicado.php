<?php
session_start();
require_once '../includes/dbConnection.php';

header('Content-Type: application/json');

try {
    // Validar campos requeridos
    if (empty($_POST['id_comunicado']) || empty($_POST['titulo']) || empty($_POST['contenido']) || empty($_POST['fecha_expiracion']) || empty($_POST['prioridad'])) {
        throw new Exception('Todos los campos son requeridos para la actualización.');
    }

    // Verificar empleado_id en sesión (asumiendo que solo empleados autorizados pueden editar)
    if (!isset($_SESSION['empleado_id'])) {
        throw new Exception('No autorizado para editar comunicados.');
    }

    // La fecha de expiración que viene del formulario debe interpretarse hasta el final del día
    $fechaExpiracion = new DateTime($_POST['fecha_expiracion'] . ' 23:59:59'); 
    
    // Obtener la fecha actual y establecerla al inicio del día (00:00:00) para una comparación justa
    $fechaActual = new DateTime();
    $fechaActual->setTime(0, 0, 0); 

    // Comparar la fecha de expiración (fin del día) con la fecha actual (inicio del día)
    if ($fechaExpiracion < $fechaActual) {
        throw new Exception('La fecha de expiración no puede ser anterior a la fecha actual.');
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