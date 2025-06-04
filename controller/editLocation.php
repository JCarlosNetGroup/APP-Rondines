<?php
session_start();
require_once '../includes/dbConnection.php';

header('Content-Type: application/json');

try {
    // Validar datos
    if (empty($_POST['id'])) {
        throw new Exception('ID de ubicación no proporcionado');
    }

    if (!is_numeric($_POST['latitud']) || !is_numeric($_POST['longitud'])) {
        throw new Exception('Latitud y longitud deben ser valores numéricos');
    }

    // Actualizar la ubicación
    $stmt = $connection->prepare("UPDATE ubicacion SET 
                                nombre = :nombre,
                                descripcion = :descripcion,
                                latitud = :latitud,
                                longitud = :longitud,
                                estado = :estado
                                WHERE id_ubicacion = :id");

    $stmt->execute([
        'nombre' => $_POST['nombre'],
        'descripcion' => $_POST['descripcion'],
        'latitud' => $_POST['latitud'],
        'longitud' => $_POST['longitud'],
        'estado' => $_POST['estado'],
        'id' => $_POST['id']
    ]);

    // El QR no se regenera, solo se actualizan los datos de la ubicación
    echo json_encode([
        'success' => true,
        'message' => 'Ubicación actualizada correctamente'
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error en la base de datos: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$connection = null;
?>