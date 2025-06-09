<?php
require_once '../includes/dbConnection.php';

header('Content-Type: application/json');

// Verifica si los parámetros requeridos están presentes
if (!isset($_GET['id_ubicacion']) || empty($_GET['id_ubicacion']) || !isset($_GET['id_rondin']) || empty($_GET['id_rondin'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: Parámetros requeridos (id_ubicacion e id_rondin) no proporcionados.'
    ]);
    exit;
}

$ubicacionId = $_GET['id_ubicacion'];
$rondinId = $_GET['id_rondin'];

try {
    // Consulta para obtener los datos de la ubicación específica
    $stmt = $connection->prepare("
        SELECT
            u.id_ubicacion,
            u.nombre,
            u.descripcion,
            u.latitud,
            u.longitud,
            rr.orden AS indice
        FROM
            ubicacion u
        JOIN
            rutas_rondin rr ON u.id_ubicacion = rr.ubicacion_id
        WHERE
            u.id_ubicacion = ? AND rr.rondin_id = ?
        LIMIT 1;
    ");
    
    $stmt->execute([$ubicacionId, $rondinId]);
    $ubicacion = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$ubicacion) {
        echo json_encode([
            'success' => false,
            'message' => 'Ubicación no encontrada o no pertenece a este rondín'
        ]);
        exit;
    }


    // Agregar flag de escaneada a la respuesta
   $ubicacion['ya_escaneada'] = false;

    echo json_encode([
        'success' => true,
        'ubicacion' => $ubicacion
    ]);

} catch (PDOException $e) {
    error_log("Error en geUbicacionForm.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener los datos de la ubicación: ' . $e->getMessage()
    ]);
}
?>