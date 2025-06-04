<?php
session_start(); 
require_once '../includes/dbConnection.php';

// Recibir datos del formulario
$usuario = $_POST['usuario'];
$contraseña = $_POST['contraseña'];

// Consulta preparada para evitar inyección SQL
$stmt = $connection->prepare(
    "SELECT 
    e.id_empleado,
    e.nombre AS nombre,
    e.apellido AS apellido,
    e.puesto AS puesto,
    e.estado AS estado,
    r.nombre_rol AS rol

    FROM usuario u
    JOIN empleado e ON u.empleado_id = e.id_empleado
    JOIN rol r ON e.rol_id = r.id_rol
    WHERE u.usuario = :username AND u.contraseña = :password"
);

$stmt->bindParam(':username', $usuario, PDO::PARAM_STR);
$stmt->bindParam(':password', $contraseña, PDO::PARAM_STR);
$stmt->execute();

// Ejecutar la consulta
try {
    // Si la consulta devuelve un registro, el usuario y contraseña son correctos
    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        // Almacenar datos del usuario en la sesión
        $_SESSION['usuario'] = $usuario;
        $_SESSION['loggedin'] = true; 
        $_SESSION['nombre'] = $row['nombre'];
        $_SESSION['apellido'] = $row['apellido'];
        $_SESSION['puesto'] = $row['puesto'];
        $_SESSION['estado'] = $row['estado'];
        $_SESSION['nombre_rol'] = $row['rol'];
        $_SESSION['empleado_id'] = $row['id_empleado'];

        // Respuesta para éxito
        echo json_encode(['status' => 'success', 'redirect' => 'pages/dashboard.php']);
        exit;
    } else {
        // Respuesta para error
        echo json_encode(['status' => 'error', 'message' => 'Usuario o contraseña incorrectos']);
        exit;
    }
} catch (PDOException $e) {
    // Manejar errores de la base de datos
    echo json_encode(['status' => 'error', 'message' => 'Error en el servidor']);
    exit;
}

// Cerrar la conexión a la base de datos
$connection = null;