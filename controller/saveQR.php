<?php
session_start();
require_once '../includes/dbConnection.php';

header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validar datos recibidos
    if (empty($data['locationId']) || empty($data['imageData'])) {
        throw new Exception('Datos incompletos para generar QR');
    }

    // Usar rutas absolutas basadas en __DIR__
    $qrDir = __DIR__ . '/../assets/qrcodes/';
    if (!file_exists($qrDir)) {
        mkdir($qrDir, 0777, true);
    }

    // Procesar imagen base64
    $imageData = str_replace('data:image/png;base64,', '', $data['imageData']);
    $imageData = str_replace(' ', '+', $imageData);
    $decodedImage = base64_decode($imageData);

    // Nombre del archivo
    $filename = 'qr_' . $data['locationId'] . '.png';
    $filepath = $qrDir . $filename;

    // Guardar imagen
    if (!file_put_contents($filepath, $decodedImage)) {
        throw new Exception('Error al guardar la imagen QR');
    }

    // Actualizar la ubicación con la ruta del QR (ruta web accesible)
    $webPath = 'centinela/assets/qrcodes/' . $filename;
    $stmt = $connection->prepare("UPDATE ubicacion SET qr_path = ? WHERE id_ubicacion = ?");
    $stmt->execute([$webPath, $data['locationId']]);

    echo json_encode([
        'success' => true,
        'message' => 'QR generado y guardado correctamente',
        'qrPath' => $webPath
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al procesar QR: ' . $e->getMessage()
    ]);
}
?>