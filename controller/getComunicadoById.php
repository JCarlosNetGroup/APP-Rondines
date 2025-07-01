<?php
session_start();
require_once '../includes/dbConnection.php';

header('Content-Type: application/json');

try {
    if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
        echo json_encode([
            'success' => false,
            'message' => 'ID de comunicado no proporcionado o inválido.'
        ]);
        exit;
    }

    $comunicadoId = (int)$_GET['id'];

    // Modificación aquí: Incluir JOIN con tabla de usuarios y seleccionar nombre_completo
    $sql = "SELECT
                c.id_comunicado,
                c.titulo,
                c.contenido,
                c.fecha_publicacion,
                c.fecha_expiracion,
                c.prioridad,
                CONCAT(e.nombre, ' ', e.apellido) AS autor,
                CASE
                    WHEN c.fecha_expiracion >= CURDATE() THEN 'vigente'
                    ELSE 'expirado'
                END AS estado_calculado 
            FROM
                comunicados c
            JOIN
                empleado e ON c.empleado_id = e.id_empleado
            WHERE
                c.id_comunicado = :id_comunicado
            LIMIT 1";

    $stmt = $connection->prepare($sql);
    $stmt->bindValue(':id_comunicado', $comunicadoId, PDO::PARAM_INT);
    $stmt->execute();
    $comunicado = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($comunicado) {
        echo json_encode([
            'success' => true,
            'comunicado' => $comunicado
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Comunicado no encontrado.'
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
} finally {
    $connection = null;
}
