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
$cycle_id = $_POST['cycle_id'] ?? null;

// Validaciones
$errors = [];
if (empty($id_ubicacion)) $errors[] = 'id_ubicacion';
if (empty($id_rondin)) $errors[] = 'id_rondin';
if (empty($empleado_id)) $errors[] = 'empleado_id (sesión)';
if (empty($cycle_id)) $errors[] = 'cycle_id';

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
    $stmt_check_rondin = $connection->prepare("SELECT id_rondin FROM rondin WHERE id_rondin = ?");
    $stmt_check_rondin->execute([$id_rondin]);
    $rondin_existe = $stmt_check_rondin->fetch();

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

    // --- LÓGICA DE ACTUALIZACIÓN ---
    // Primero, intenta encontrar un reporte existente con estatus 'Pendiente'
    // para esta combinación de ubicacion, empleado, rondin y ciclo.
    $stmt_find_report = $connection->prepare("
        SELECT id_reporte, imagen FROM reporte
        WHERE ubicacion_id = ?
          AND empleado_id = ?
          AND rondin_id = ?
          AND ciclo_id = ?
          AND estatus = 'Pendiente'
    ");
    $stmt_find_report->execute([$id_ubicacion, $empleado_id, $id_rondin, $cycle_id]);
    $existing_report = $stmt_find_report->fetch(PDO::FETCH_ASSOC);

    if ($existing_report) {
        // Si existe un reporte pendiente, lo actualizamos
        $reporte_id_to_update = $existing_report['id_reporte'];
        $old_image_path = $existing_report['imagen'] ? '../assets/imagesReport/' . $existing_report['imagen'] : null;

        $update_query = "
            UPDATE reporte SET
                observacion = ?,
                imagen = ?,
                estatus = 'Completado',
                fecha_escaneo = NOW()
            WHERE id_reporte = ?
        ";
        $stmt_update = $connection->prepare($update_query);
        $stmt_update->execute([$observacion, $nombre_foto, $reporte_id_to_update]);

        // Si se subió una nueva imagen y existía una antigua, borra la antigua
        if ($nombre_foto && $old_image_path && file_exists($old_image_path) && $old_image_path !== '../assets/imagesReport/default.jpg') { // Asegúrate de no borrar una imagen por defecto
            unlink($old_image_path);
        }

        echo json_encode([
            'success' => true,
            'reporte_id' => $reporte_id_to_update,
            'message' => 'Reporte actualizado exitosamente a Completado.'
        ]);

    } else {
        throw new Exception('No se encontró un reporte pendiente para actualizar con los datos proporcionados. El ciclo o la ubicación ya fueron completados, o los IDs no coinciden.');

    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}