<?php
session_start();
require_once '../includes/dbConnection.php';

header('Content-Type: application/json');

try {
    $page = isset($_GET['page']) && is_numeric($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = 9;
    $offset = ($page - 1) * $limit;

    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $dateFrom = isset($_GET['dateFrom']) ? $_GET['dateFrom'] : '';
    $dateTo = isset($_GET['dateTo']) ? $_GET['dateTo'] : '';
    $filterStatus = isset($_GET['status']) ? $_GET['status'] : '';
    $prioridad = isset($_GET['prioridad']) ? $_GET['prioridad'] : '';

    $whereClauses = [];
    $params = [];

    if (!empty($search)) {
        $whereClauses[] = "(c.titulo LIKE :search OR c.contenido LIKE :search)";
        $params[':search'] = '%' . $search . '%';
    }

    if (!empty($dateFrom)) {
        $whereClauses[] = "c.fecha_publicacion >= :dateFrom";
        $params[':dateFrom'] = $dateFrom . ' 00:00:00';
    }
    if (!empty($dateTo)) {
        $whereClauses[] = "c.fecha_publicacion <= :dateTo";
        $params[':dateTo'] = $dateTo . ' 23:59:59';
    }

    if (!empty($filterStatus)) {
        switch ($filterStatus) {
            case 'vigente':
                $whereClauses[] = "c.fecha_expiracion >= CURDATE()";
                break;
            case 'expirado':
                $whereClauses[] = "c.fecha_expiracion < CURDATE()";
                break;
            case 'importante':
                $whereClauses[] = "c.prioridad = 'importante'";
                break;
            case 'normal':
                $whereClauses[] = "c.prioridad = 'normal'";
                break;
        }
    }

    if (!empty($prioridad)) {
        $whereClauses[] = "c.prioridad = :prioridad";
        $params[':prioridad'] = $prioridad;
    }

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
                empleado e ON c.empleado_id = e.id_empleado";

    if (!empty($whereClauses)) {
        $sql .= " WHERE " . implode(" AND ", $whereClauses);
    }
    $sql .= " ORDER BY c.fecha_publicacion DESC, c.id_comunicado DESC LIMIT :limit OFFSET :offset";

    $stmt = $connection->prepare($sql);

    foreach ($params as $key => &$val) {
        $stmt->bindValue($key, $val);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $comunicados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $countSql = "SELECT COUNT(*)
                 FROM comunicados c
                 JOIN empleado e ON c.empleado_id = e.id_empleado";
    if (!empty($whereClauses)) {
        $countSql .= " WHERE " . implode(" AND ", $whereClauses);
    }

    $countStmt = $connection->prepare($countSql);
    foreach ($params as $key => &$val) {
        $countStmt->bindValue($key, $val);
    }
    $countStmt->execute();
    $totalComunicados = $countStmt->fetchColumn();
    $totalPages = ceil($totalComunicados / $limit);

    echo json_encode([
        'success' => true,
        'comunicados' => $comunicados,
        'pagination' => [
            'currentPage' => $page,
            'totalPages' => $totalPages,
            'totalItems' => $totalComunicados
        ]
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
} finally {
    $connection = null;
}
