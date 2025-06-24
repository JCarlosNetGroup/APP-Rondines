<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
session_start();

require_once '../includes/dbConnection.php';

header('Content-Type: application/json');

// Verificar sesión
if (!isset($_SESSION['loggedin'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No autorizado. Inicie sesión.']);
    exit;
}

// Obtener datos
$id_ubicacion = $_POST['id_ubicacion'] ?? null;
$id_rondin = $_POST['id_rondin'] ?? null;
$observacion = $_POST['observacion'] ?? '';
$empleado_id = $_SESSION['empleado_id'] ?? null;

// Validaciones
$errors = [];
if (empty($id_ubicacion)) $errors[] = 'id_ubicacion';
if (empty($id_rondin)) $errors[] = 'id_rondin';
if (empty($empleado_id)) $errors[] = 'empleado_id (sesión)';

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Datos incompletos',
        'missing_fields' => $errors
    ]);
    exit;
}

try {
    // Validar que el rondin_id exista
    $stmt_check = $connection->prepare("SELECT id_rondin FROM rondin WHERE id_rondin = ?");
    $stmt_check->execute([$id_rondin]);
    $rondin_existe = $stmt_check->fetch();

    if (!$rondin_existe) {
        throw new Exception('El ID de rondín no existe.');
    }

    // Procesar foto
    $nombre_foto = null;
    if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
        $allowed_types = ['image/jpeg', 'image/png', 'image/gif'];
        $file_info = finfo_open(FILEINFO_MIME_TYPE);
        $mime_type = finfo_file($file_info, $_FILES['foto']['tmp_name']);
        finfo_close($file_info);

        if (!in_array($mime_type, $allowed_types)) {
            throw new Exception('Tipo de archivo no permitido. Solo JPEG, PNG o GIF.');
        }

        $extension = pathinfo($_FILES['foto']['name'], PATHINFO_EXTENSION);
        $nombre_foto = 'reporte_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $extension;
        $directorio = '../assets/imagesReport/';

        if (!file_exists($directorio)) {
            mkdir($directorio, 0755, true);
        }

        $ruta_guardado = $directorio . $nombre_foto;
        if (!move_uploaded_file($_FILES['foto']['tmp_name'], $ruta_guardado)) {
            throw new Exception('Error al guardar la imagen.');
        }
    }

    // Consulta SQL con rondin_id
    $stmt = $connection->prepare("
        INSERT INTO reporte (
            ubicacion_id,
            empleado_id,
            rondin_id,
            observacion,
            imagen,
            fecha
        ) VALUES (?, ?, ?, ?, ?, NOW())
    ");

    $stmt->execute([
        $id_ubicacion,
        $empleado_id,
        $id_rondin,  // <-- Valor crítico
        $observacion,
        $nombre_foto
    ]);

    echo json_encode([
        'success' => true,
        'reporte_id' => $connection->lastInsertId(),
        'message' => 'Reporte guardado exitosamente.'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}