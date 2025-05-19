<?php
require_once '../includes/dbConnection.php';

header('Content-Type: application/json');

try {
    $sql = "SELECT id_ubicacion as id, nombre, estado 
            FROM ubicacion
            ORDER BY nombre ASC";
    
    $stmt = $connection->prepare($sql);
    if (!$stmt->execute()) {
        throw new PDOException("Error al ejecutar la consulta");
    }
    
    $ubicaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Asegurar que siempre hay un array, aunque esté vacío
    echo json_encode([
        'success' => true,
        'data' => $ubicaciones ?: []
    ]);
    exit; // Terminar ejecución después de enviar JSON
    
} catch (PDOException $e) {
    
    // Enviar respuesta de error en formato JSON
    echo json_encode([
        'success' => false,
        'message' => "Error al obtener ubicaciones"
    ]);
    exit;
}
exit;