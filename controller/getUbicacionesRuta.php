<?php
require_once '../includes/dbConnection.php';

header('Content-Type: application/json');

// Verifica si id_rondin está presente en la URL y no está vacío
if (!isset($_GET['id_rondin']) || empty($_GET['id_rondin'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ID de rondín no proporcionado.'
    ]);
    exit; // Detiene la ejecución del script
}

// Si llegamos aquí, el ID está presente
$rondinId = $_GET['id_rondin'];

try {
    $stmt = $connection->prepare("
        SELECT
            u.id_ubicacion,
            u.nombre,
            u.descripcion,
            u.latitud,
            u.longitud,
            rr.orden
        FROM
            rutas_rondin rr
        JOIN
            ubicacion u ON rr.ubicacion_id = u.id_ubicacion
        JOIN
            rondin r ON rr.rondin_id = r.id_rondin
        WHERE
            rr.rondin_id = ?
        ORDER BY
            rr.orden ASC;
    ");
    $stmt->execute([$rondinId]);
    $ubicaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'ubicaciones' => $ubicaciones,
        'count' => count($ubicaciones)
    ]);
} catch (PDOException $e) {
    error_log("Error en getUbicacionesRuta.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener ubicaciones: ' . $e->getMessage()
    ]);
}
?>
