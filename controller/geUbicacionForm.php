<?php
require_once '../includes/dbConnection.php';
require_once '../controller/ValidarSesion.php';

header('Content-Type: application/json');

// --- 1. Capturar TODOS los parámetros requeridos, -
if (!isset($_GET['id_ubicacion']) || empty($_GET['id_ubicacion']) ||
    !isset($_GET['id_rondin']) || empty($_GET['id_rondin']) ||
    !isset($_GET['cycle_id']) || empty($_GET['cycle_id']) ||
    !isset($_SESSION['empleado_id']) || empty($_SESSION['empleado_id'])) {
    
    echo json_encode([
        'success' => false,
        'message' => 'Error: Parámetros requeridos (id_ubicacion, id_rondin, cycle_id, o sesion de empleado) no proporcionados.'
    ]);
    exit;
}

$ubicacionId = $_GET['id_ubicacion'];
$rondinId = $_GET['id_rondin'];
$cycleId = $_GET['cycle_id'];
$empleadoId = $_SESSION['empleado_id'];

try {
    // --- 2. Consulta para obtener los datos de la ubicación específica
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

    // --- 3. Consulta para obtener el ESTADO del reporte para esta ubicación, rondín, ciclo y empleado ---
    $stmtReporte = $connection->prepare("
        SELECT 
            id_reporte,
            observacion,
            imagen,
            estatus,
            fecha_escaneo
        FROM 
            reporte
        WHERE 
            ubicacion_id = ? 
            AND rondin_id = ? 
            AND ciclo_id = ? 
            AND empleado_id = ?
        LIMIT 1;
    ");

    $stmtReporte->execute([$ubicacionId, $rondinId, $cycleId, $empleadoId]);
    $reporteExistente = $stmtReporte->fetch(PDO::FETCH_ASSOC);

    // Si existe un reporte y su estatus es 'Completado', marcamos como escaneada.
    $ubicacion['ya_escaneada'] = ($reporteExistente && $reporteExistente['estatus'] === 'Completado');
    $ubicacion['reporte_data'] = $reporteExistente; // Enviamos todos los datos del reporte existente

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