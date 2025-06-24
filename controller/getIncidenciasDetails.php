<?php
require_once '../includes/dbConnection.php';
require_once '../controller/ValidarSesion.php';

header('Content-Type: application/json');

$response = ['success' => false, 'message' => 'Error desconocido', 'incidencias' => []];

try {
    if (!isset($_GET['id_reporte'])) {
        throw new Exception('ID de reporte no proporcionado');
    }

    $idReporte = filter_var($_GET['id_reporte'], FILTER_SANITIZE_NUMBER_INT);
    
    $stmt = $connection->prepare("
        SELECT
            i.id_incidencia,
            i.descripcion,
            i.fecha,
            i.foto,
            i.riesgo,
            u.nombre AS nombre_ubicacion,
            e.nombre AS nombre_empleado
        FROM
            incidencia i
        JOIN
            reporte r ON i.reporte_id = r.id_reporte
        JOIN
            ubicacion u ON r.ubicacion_id = u.id_ubicacion
        JOIN
            empleado e ON r.empleado_id = e.id_empleado
        WHERE
            r.id_reporte = ?
    ");
    
    $stmt->execute([$idReporte]);
    $incidencias = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Procesar las imágenes
    foreach ($incidencias as &$incidencia) {
        $incidencia['imagenes'] = [];
        if (!empty($incidencia['foto'])) {
            // Si hay múltiples imágenes separadas por comas (ajustar según necesidad)
            $imagenes = explode(',', $incidencia['foto']);
            foreach ($imagenes as $img) {
                if (!empty(trim($img))) {
                    $incidencia['imagenes'][] = trim($img);
                }
            }
        }
        unset($incidencia['foto']);
    }
    
    $response = [
        'success' => true,
        'message' => 'Incidencias obtenidas correctamente',
        'incidencias' => $incidencias
    ];
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
?>