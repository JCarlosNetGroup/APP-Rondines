<?php
require_once '../includes/dbConnection.php';
require_once '../includes/ValidarSesion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// Obtener empleado_id de la sesión (igual que en guardarReporte.php)
$empleado_id = $_SESSION['empleado_id'] ?? null;

// Obtener datos del formulario
$reporte_id = $_POST['reporte_id'] ?? null;
$ubicacion_id = $_POST['ubicacion_id'] ?? null;
$descripcion = $_POST['descripcion_incidencia'] ?? null;
$riesgo = $_POST['riesgo'] ?? 'medio';

// Validaciones básicas (similar a guardarReporte.php)
if (!$empleado_id || !$reporte_id || !$ubicacion_id || !$descripcion) {
    echo json_encode([
        'success' => false,
        'message' => 'Datos incompletos',
        'missing' => [
            !$empleado_id ? 'empleado_id' : null,
            !$reporte_id ? 'reporte_id' : null,
            !$ubicacion_id ? 'ubicacion_id' : null,
            !$descripcion ? 'descripcion_incidencia' : null
        ]
    ]);
    exit;
}

try {
    // Procesar foto de incidencia (igual que en guardarReporte.php)
    $nombre_foto_incidencia = null;
    if (isset($_FILES['foto_incidencia']) && $_FILES['foto_incidencia']['error'] === UPLOAD_ERR_OK) {
        $allowed = ['image/jpeg', 'image/png', 'image/gif'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $_FILES['foto_incidencia']['tmp_name']);
        finfo_close($finfo);
        
        if (!in_array($mime, $allowed)) {
            throw new Exception('Tipo de archivo no permitido. Solo imágenes JPEG, PNG o GIF.');
        }

        $uploadDir = '../assets/imagesIncidencias/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $ext = pathinfo($_FILES['foto_incidencia']['name'], PATHINFO_EXTENSION);
        $nombre_foto_incidencia = 'incidencia_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $destino = $uploadDir . $nombre_foto_incidencia;

        if (!move_uploaded_file($_FILES['foto_incidencia']['tmp_name'], $destino)) {
            throw new Exception('Error al mover el archivo subido');
        }
    }

    // Insertar incidencia
    $stmt = $connection->prepare("
        INSERT INTO incidencia (
            reporte_id,
            empleado_id,
            ubicacion_id,
            descripcion,
            foto,
            riesgo,
            fecha
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    ");
    
    $stmt->execute([
        $reporte_id,
        $empleado_id,
        $ubicacion_id,
        $descripcion,
        $nombre_foto_incidencia,
        $riesgo
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Incidencia guardada exitosamente',
        'incidencia_id' => $connection->lastInsertId()
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error de base de datos: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}