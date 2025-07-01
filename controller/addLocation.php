<?php
session_start();
require_once '../includes/dbConnection.php';

header('Content-Type: application/json');

try {
    // Validar campos requeridos
    if (empty($_POST['nombre']) || empty($_POST['latitud']) || empty($_POST['longitud'])) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son requeridos']);
        exit;
    }

    // Validar que latitud y longitud sean numéricos
    if (!is_numeric($_POST['latitud']) || !is_numeric($_POST['longitud'])) {
        echo json_encode(['success' => false, 'message' => 'Latitud y longitud deben ser valores numéricos']);
        exit;
    }

    // Verificar si el nombre ya existe
    $sqlCheck = "SELECT COUNT(*) FROM ubicacion WHERE nombre = :nombre";
    $stmtCheck = $connection->prepare($sqlCheck);
    $stmtCheck->execute(['nombre' => $_POST['nombre']]);
    $exists = $stmtCheck->fetchColumn();

    if ($exists > 0) {
        echo json_encode(['success' => false, 'message' => 'Ya existe una ubicación con este nombre']);
        exit;
    }

    // Iniciar transacción
    $connection->beginTransaction();

    // Insertar en la tabla ubicacion
    $sqlUbicacion = "INSERT INTO ubicacion (nombre, descripcion, latitud, longitud, estado, qr_path) 
                    VALUES (:nombre, :descripcion, :latitud, :longitud, :estado, '')";
    $stmtUbicacion = $connection->prepare($sqlUbicacion);
    
    $stmtUbicacion->execute([
        'nombre' => $_POST['nombre'],
        'descripcion' => $_POST['descripcion'] ?? null,
        'latitud' => $_POST['latitud'],
        'longitud' => $_POST['longitud'],
        'estado' => $_POST['estado'],
    ]);

    // Obtener el ID de la ubicación recién insertada
    $ubicacionId = $connection->lastInsertId();

    // Confirmar la transacción
    $connection->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Ubicación registrada correctamente',
        'id' => $ubicacionId // Devolvemos el ID para el QR
    ]);

} catch (PDOException $e) {
    // Revertir la transacción en caso de error
    if ($connection->inTransaction()) {
        $connection->rollBack();
    }
    
    echo json_encode([
        'success' => false,
        'message' => 'Error al registrar la ubicación: ' . $e->getMessage()
    ]);
}

$connection = null;
?>