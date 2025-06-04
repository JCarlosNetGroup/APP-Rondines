<?php

require_once '../includes/dbConnection.php';


$roles = []; // Inicializamos un array para almacenar los roles

try {
    // Consulta para obtener los roles de la tabla 'rol'
    $stmt = $connection->query("SELECT id_rol, nombre_rol FROM rol;");
    $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);

} catch (PDOException $e) {

    die("Error al consultar la base de datos: " . $e->getMessage());
}


?>