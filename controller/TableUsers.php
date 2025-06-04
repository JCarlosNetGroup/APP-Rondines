<?php
require_once '../includes/dbConnection.php';

try {
    // Obtener el término de búsqueda y el estado si están presentes
    $searchTerm = isset($_GET['search']) ? $_GET['search'] : '';
    $estadoFiltro = isset($_GET['estado']) ? strtolower($_GET['estado']) : '';
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

    // Si hay un estado específico seleccionado
    if (!empty($estadoFiltro)) {
        $conditions[] = "LOWER(e.estado) = :estadoFiltro";
    } elseif (empty($searchTerm)) {
        // Si NO hay término de búsqueda NI estado seleccionado, mostrar solo 'Activo'
        $conditions[] = "e.estado = 'Activo'";
    }

    // Si hay un término de búsqueda, agregar las condiciones de búsqueda
    if (!empty($searchTerm)) {
        foreach ($searchWords as $index => $word) {
            $conditions[] = "(
                e.nombre LIKE :searchWord{$index} OR 
                e.apellido LIKE :searchWord{$index} OR 
                r.nombre_rol LIKE :searchWord{$index}
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
?>