<?php
session_start(); // Iniciar sesión

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
        $_SESSION['loggedin'] = true; // Indicar que el usuario ha iniciado sesión
        $_SESSION['nombre'] = $row['nombre'];
        $_SESSION['apellido'] = $row['apellido'];
        $_SESSION['puesto'] = $row['puesto'];
        $_SESSION['estado'] = $row['estado'];
        $_SESSION['nombre_rol'] = $row['rol'];

        // Redirigir a la página de inicio
        header('Location: ../pages/dashboard.php');
        exit; // Detener la ejecución del script
    } else {
        // Mostrar mensaje de error y redirigir a la página de login
        $_SESSION['error'] = "Usuario o contraseña incorrectos.";
        header('Location: ../index.php');
        exit; // Detener la ejecución del script
    }
} catch (PDOException $e) {
    // Manejar errores de la base de datos
    die("Error al ejecutar la consulta: " . $e->getMessage());
}

// Cerrar la conexión a la base de datos
$connection = null;
