<?php
require_once '../includes/dbConnection.php';

try {
    // Obtener el término de búsqueda y estado si están presentes
    $searchTerm = isset($_GET['search']) ? $_GET['search'] : '';
    $estadoFiltro = isset($_GET['estado']) ? strtolower($_GET['estado']) : '';
    $searchWords = explode(' ', $searchTerm);

    // Consulta SQL base
    $sql = "SELECT 
                id_ubicacion, 
                nombre, 
                descripcion, 
                latitud, 
                longitud, 
                estado, 
                qr_path
            FROM ubicacion";

    // Array para almacenar condiciones
    $conditions = [];

    // Si hay un estado específico seleccionado
    if (!empty($estadoFiltro)) {
        $conditions[] = "LOWER(estado) = :estadoFiltro";
    } elseif (empty($searchTerm)) {
        // Si NO hay término de búsqueda NI estado seleccionado, mostrar solo 'Activa'
        $conditions[] = "LOWER(estado) = 'activa'";
    }

    // Si hay un término de búsqueda, agregar las condiciones de búsqueda
    if (!empty($searchTerm)) {
        foreach ($searchWords as $index => $word) {
            $conditions[] = "(
                nombre LIKE :searchWord{$index} OR 
                latitud LIKE :searchWord{$index} OR 
                longitud LIKE :searchWord{$index} OR
                estado LIKE :searchWord{$index}
            )";
        }
    }

    // Si hay condiciones, agregarlas a la consulta SQL
    if (!empty($conditions)) {
        $sql .= " WHERE " . implode(' AND ', $conditions);
    }

    $stmt = $connection->prepare($sql);

    // Bindear parámetros
    if (!empty($estadoFiltro)) {
        $stmt->bindValue(":estadoFiltro", $estadoFiltro, PDO::PARAM_STR);
    }

    if ($searchTerm) {
        foreach ($searchWords as $index => $word) {
            $searchWord = "%$word%";
            $stmt->bindValue(":searchWord{$index}", $searchWord, PDO::PARAM_STR);
        }
    }

    $stmt->execute();

    // Obtener los resultados
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Preparar la respuesta JSON
    $response = [
        'data' => $data,
        'totalRegistros' => count($data)
    ];

    // Convertir el array a JSON
    header('Content-Type: application/json');
    echo json_encode($response);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => "Error en la operación: " . $e->getMessage()
    ]);
    die();
}