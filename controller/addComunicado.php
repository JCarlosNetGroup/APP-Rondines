<?php
session_start();
require_once '../includes/dbConnection.php';

header('Content-Type: application/json');

try {
    if (empty($_POST['titulo']) || empty($_POST['descripcion'])) {
        throw new Exception('Título y descripción son requeridos');
    }

    // Verificar empleado_id en sesión
    if (!isset($_SESSION['empleado_id'])) {
        throw new Exception('No autorizado');
    }

    $connection->beginTransaction();

    $nombreArchivo = null;
    $rutaArchivo = null;
    
    if (isset($_FILES['archivo']) && $_FILES['archivo']['error'] === UPLOAD_ERR_OK) {
        $directorioUploads = '../assets/dataComunicados/';


        $extensionesPermitidas = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx'];
        $nombreArchivo = $_FILES['archivo']['name'];
        $extension = strtolower(pathinfo($nombreArchivo, PATHINFO_EXTENSION));
        
        if (!in_array($extension, $extensionesPermitidas)) {
            throw new Exception('Tipo de archivo no permitido');
        }

        $nombreUnico = uniqid() . '_' . time() . '.' . $extension;
        $rutaArchivo = $directorioUploads . $nombreUnico;

        if (!move_uploaded_file($_FILES['archivo']['tmp_name'], $rutaArchivo)) {
            throw new Exception('Error al subir el archivo');
        }
    }

    // Usar empleado_id en la consulta
    $sql = "INSERT INTO comunicados 
            (titulo, descripcion, nombre_archivo, ruta_archivo, empleado_id, fecha) 
            VALUES (:titulo, :descripcion, :nombre_archivo, :ruta_archivo, :empleado_id, NOW())";
    
    $stmt = $connection->prepare($sql);
    $stmt->execute([
        'titulo' => $_POST['titulo'],
        'descripcion' => $_POST['descripcion'],
        'nombre_archivo' => $nombreArchivo,
        'ruta_archivo' => $rutaArchivo,
        'empleado_id' => $_SESSION['empleado_id']
    ]);

    $connection->commit();

// Después del commit
$lastId = $connection->lastInsertId();

echo json_encode([
    'success' => true,
    'message' => 'Comunicado publicado correctamente',
    'newId' => $lastId
]);

} catch (Exception $e) {
    if ($connection->inTransaction()) {
        $connection->rollBack();
    }
    
    if (isset($rutaArchivo)) {
        @unlink($rutaArchivo);
    }
    
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$connection = null;
?>