<?php
require_once '../includes/dbConnection.php';

header('Content-Type: application/json');

try {
    $sql = "SELECT id_ubicacion as id, nombre, estado 
            FROM ubicacion
            WHERE estado = 'Activa'
            ORDER BY nombre ASC";
    
    $stmt = $connection->prepare($sql);
    if (!$stmt->execute()) {
        throw new PDOException("Error al ejecutar la consulta");
    }
    
    $ubicaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $ubicaciones ?: [],
        'message' => $ubicaciones ? 'Ubicaciones activas obtenidas' : 'No hay ubicaciones activas'
    ]);
    exit;
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => "Error al obtener ubicaciones: " . $e->getMessage()
    ]);
    exit;
}
?>