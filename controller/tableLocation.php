<?php
require_once '../includes/dbConnection.php';

try {
    // Obtener el término de búsqueda si está presente
    $searchTerm = isset($_GET['search']) ? $_GET['search'] : '';
    $searchWords = explode(' ', $searchTerm);

    // Consulta SQL base
    $sql = "SELECT 
                id_ubicacion, 
                nombre, 
                descripcion, 
                latitud, 
                longitud, 
                estado 

            FROM ubicacion";

    // Definicion de un array para almacenar condiciones
    $conditions = [];


    // Si hay un término de búsqueda, agregar la condición WHERE
    if ($searchTerm) {
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

    // Si hay un término de búsqueda, bindear cada palabra
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
