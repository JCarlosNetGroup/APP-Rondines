<?php
require_once '../includes/dbConnection.php';
require_once '../controller/ValidarSesion.php';

header('Content-Type: application/json');

$response = ['success' => false, 'message' => 'Error desconocido', 'images' => []];

try {
    if (!isset($_GET['id_reporte'])) {
        throw new Exception('ID de reporte no proporcionado');
    }

    $idReporte = filter_var($_GET['id_reporte'], FILTER_SANITIZE_NUMBER_INT);
    
    // Consulta para obtener imágenes del reporte (ajusta según tu estructura)
    $stmt = $connection->prepare("
        SELECT imagen 
        FROM reporte 
        WHERE id_reporte = ?
    ");
    $stmt->execute([$idReporte]);
    $imagenes = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Extraer solo los nombres de archivo
    $imagenes = array_map(function($ruta) {
        return basename($ruta);
    }, $imagenes);
    
    $response = [
        'success' => true,
        'message' => 'Imágenes obtenidas correctamente',
        'images' => $imagenes
    ];
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
?>