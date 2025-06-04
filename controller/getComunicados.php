<?php
session_start();
require_once '../includes/dbConnection.php';

header('Content-Type: application/json');

try {
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $perPage = 6; // Comunicados por página
    $offset = ($page - 1) * $perPage;

    // Obtener total de comunicados
    $totalQuery = $connection->query("SELECT COUNT(*) FROM comunicados");
    $total = $totalQuery->fetchColumn();
    $totalPages = ceil($total / $perPage);

    // Obtener comunicados paginados
    $sql = "SELECT * FROM comunicados ORDER BY fecha DESC LIMIT :perPage OFFSET :offset";
    $stmt = $connection->prepare($sql);
    $stmt->bindValue(':perPage', $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $comunicados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'comunicados' => $comunicados,
        'pagination' => [
            'currentPage' => $page,
            'totalPages' => $totalPages,
            'totalItems' => $total
        ]
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$connection = null;
