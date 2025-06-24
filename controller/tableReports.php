<?php
require_once '../includes/dbConnection.php';

header('Content-Type: application/json');

try {
    // Obtener parámetros
    $searchTerm = $_GET['search'] ?? '';
    $fechaInicio = $_GET['fecha_inicio'] ?? '';
    $fechaFin = $_GET['fecha_fin'] ?? '';
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $itemsPerPage = isset($_GET['itemsPerPage']) ? (int)$_GET['itemsPerPage'] : 10;

    // Validar paginación
    $page = max(1, $page);
    $itemsPerPage = max(1, min(100, $itemsPerPage));
    $offset = ($page - 1) * $itemsPerPage;

    $searchWords = explode(' ', $searchTerm);

    // Consulta para contar total de registros
    $countSql = "SELECT COUNT(*) as total FROM reporte a
        JOIN empleado b ON a.empleado_id = b.id_empleado
        JOIN ubicacion c ON a.ubicacion_id = c.id_ubicacion
        JOIN rutas_rondin d ON (c.id_ubicacion = d.ubicacion_id AND a.rondin_id = d.rondin_id)
        JOIN rondin e ON a.rondin_id = e.id_rondin";

    // Consulta para obtener datos
    $sql = "SELECT
            a.id_reporte,
            e.nombre AS Rondin,
            c.nombre AS Ubicacion,
            d.orden AS Orden,
            (SELECT COUNT(*) FROM incidencia x WHERE x.reporte_id = a.id_reporte) AS Incidencia,
            CONCAT(b.nombre, ' ', b.apellido) AS Guardia,
            a.observacion,
            a.fecha
        FROM reporte a
        JOIN empleado b ON a.empleado_id = b.id_empleado
        JOIN ubicacion c ON a.ubicacion_id = c.id_ubicacion
        JOIN rutas_rondin d ON (c.id_ubicacion = d.ubicacion_id AND a.rondin_id = d.rondin_id)
        JOIN rondin e ON a.rondin_id = e.id_rondin";

    $conditions = [];

    // Filtros de fecha
    if (!empty($fechaInicio)) {
        $conditions[] = "a.fecha >= :fecha_inicio";
    }
    if (!empty($fechaFin)) {
        $conditions[] = "a.fecha <= :fecha_fin";
    }

    // Búsqueda
    if (!empty($searchTerm)) {
        $searchConditions = [];
        foreach ($searchWords as $index => $word) {
            $searchConditions[] = "(
                CONCAT(b.nombre, ' ', b.apellido) LIKE :searchWord{$index} OR
                a.observacion LIKE :searchWord{$index} OR
                e.nombre LIKE :searchWord{$index} OR
                c.nombre LIKE :searchWord{$index}
            )";
        }
        $conditions[] = "(" . implode(" AND ", $searchConditions) . ")";
    }

    // Aplicar condiciones
    if (!empty($conditions)) {
        $whereClause = " WHERE " . implode(" AND ", $conditions);
        $countSql .= $whereClause;
        $sql .= $whereClause;
    }

    // Ordenar
    $sql .= " ORDER BY a.fecha DESC";

    // Preparar y ejecutar consulta de conteo
    $countStmt = $connection->prepare($countSql);

    if (!empty($fechaInicio)) {
        $countStmt->bindValue(":fecha_inicio", $fechaInicio . ' 00:00:00');
    }
    if (!empty($fechaFin)) {
        $countStmt->bindValue(":fecha_fin", $fechaFin . ' 23:59:59');
    }

    if (!empty($searchTerm)) {
        foreach ($searchWords as $index => $word) {
            $countStmt->bindValue(":searchWord{$index}", "%$word%");
        }
    }

    $countStmt->execute();
    $total = $countStmt->fetchColumn();

    // Consulta principal con paginación
    $sql .= " LIMIT :limit OFFSET :offset";
    $stmt = $connection->prepare($sql);

    // Bind parameters
    if (!empty($fechaInicio)) {
        $stmt->bindValue(":fecha_inicio", $fechaInicio . ' 00:00:00');
    }
    if (!empty($fechaFin)) {
        $stmt->bindValue(":fecha_fin", $fechaFin . ' 23:59:59');
    }

    if (!empty($searchTerm)) {
        foreach ($searchWords as $index => $word) {
            $stmt->bindValue(":searchWord{$index}", "%$word%");
        }
    }

    $stmt->bindValue(":limit", $itemsPerPage, PDO::PARAM_INT);
    $stmt->bindValue(":offset", $offset, PDO::PARAM_INT);
    $stmt->execute();

    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Respuesta
    echo json_encode([
        'success' => true,
        'data' => $data,
        'totalRegistros' => (int)$total,
        'paginaActual' => $page,
        'totalPaginas' => ceil($total / $itemsPerPage),
        'itemsPorPagina' => $itemsPerPage
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => "Error en la operación: " . $e->getMessage()
    ]);
    die();
}