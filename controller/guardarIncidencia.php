<?php
require_once '../includes/dbConnection.php';
require_once '../includes/ValidarSesion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// Obtener datos del formulario
$reporte_id = $_POST['reporte_id'] ?? null;
$tipo_incidencia = $_POST['tipo_incidencia'] ?? null;
$descripcion = $_POST['descripcion_incidencia'] ?? null;
$riesgo = $_POST['riesgo'] ?? 'medio'; // Valor por defecto
$empleado_id = $_SESSION['user_id'] ?? null;

// Validaciones
if (!$reporte_id || !$tipo_incidencia || !$descripcion || !$empleado_id) {
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit;
}

try {
    // Procesar foto de incidencia
    $nombre_foto_incidencia = null;
    if (isset($_FILES['foto_incidencia']) && $_FILES['foto_incidencia']['error'] === UPLOAD_ERR_OK) {
        $extension = pathinfo($_FILES['foto_incidencia']['name'], PATHINFO_EXTENSION);
        $nombre_foto_incidencia = 'incidencia_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $extension;
        move_uploaded_file($_FILES['foto_incidencia']['tmp_name'], '../uploads/incidencias/' . $nombre_foto_incidencia);
    }

    // Insertar incidencia
    $stmt = $connection->prepare("
        INSERT INTO incidencias (
            reporte_id,
            empleado_id,
            tipo,
            descripcion,
            foto,
            riesgo,
            estado,
            fecha_creacion
        ) VALUES (?, ?, ?, ?, ?, ?, 'pendiente', NOW())
    ");
    
    $stmt->execute([
        $reporte_id,
        $empleado_id,
        $tipo_incidencia,
        $descripcion,
        $nombre_foto_incidencia,
        $riesgo
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Incidencia guardada exitosamente'
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al guardar la incidencia: ' . $e->getMessage()
    ]);
}