<?php
require_once '../includes/dbConnection.php';

try {
    // Obtener el término de búsqueda si está presente
    $searchTerm = isset($_GET['search']) ? $_GET['search'] : '';
    $searchWords = explode(' ', $searchTerm);

    // Consulta SQL base
    $sql = "SELECT e.id_empleado,
       e.nombre,
       e.apellido,
       e.puesto,
       e.telefono,
       r.id_rol,
       r.nombre_rol,
       u.usuario,
       u.contraseña AS contrasena,
       e.estado

FROM empleado e
JOIN rol r ON e.rol_id = r.id_rol
JOIN usuario u ON e.id_empleado = u.empleado_id";

    // Array para almacenar las condiciones
    $conditions = [];

    // Si hay un término de búsqueda, agregar la condición WHERE
    if ($searchTerm) {
        foreach ($searchWords as $index => $word) {
            $conditions[] = "(
            e.nombre LIKE :searchWord{$index} OR 
            e.apellido LIKE :searchWord{$index} OR 
            r.nombre_rol LIKE :searchWord{$index} OR
            e.estado LIKE :searchWord{$index}
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
?>