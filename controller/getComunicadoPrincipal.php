<?php
session_start();
require_once '../includes/dbConnection.php';

header('Content-Type: application/json');

try {
    $comunicadoPrincipal = null;

    // Intenta obtener el comunicado más reciente y vigente con prioridad 'importante'
    // Modificación aquí: Incluir JOIN con tabla de usuarios y seleccionar nombre_completo
    $sqlImportante = "SELECT
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
                        c.fecha_expiracion >= CURDATE() AND c.prioridad = 'importante'
                      ORDER BY
                        c.fecha_publicacion DESC, c.id_comunicado DESC
                      LIMIT 1";
    
    $stmtImportante = $connection->prepare($sqlImportante);
    $stmtImportante->execute();
    $comunicadoPrincipal = $stmtImportante->fetch(PDO::FETCH_ASSOC);

    // Si no se encuentra un comunicado importante vigente, busca el comunicado más reciente y vigente (sin importar la prioridad)
    if (!$comunicadoPrincipal) {
        // Modificación aquí: Incluir JOIN con tabla de usuarios y seleccionar nombre_completo
        $sqlGeneral = "SELECT
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
                        c.fecha_expiracion >= CURDATE()
                       ORDER BY
                        c.fecha_publicacion DESC, c.id_comunicado DESC
                       LIMIT 1";
        
        $stmtGeneral = $connection->prepare($sqlGeneral);
        $stmtGeneral->execute();
        $comunicadoPrincipal = $stmtGeneral->fetch(PDO::FETCH_ASSOC);
    }

    if ($comunicadoPrincipal) {
        echo json_encode([
            'success' => true,
            'comunicado' => $comunicadoPrincipal
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No hay comunicado principal vigente.'
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
?>