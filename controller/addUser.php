<?php
session_start();
require_once '../includes/dbConnection.php';

try {
    // Recibir los datos del formulario
    $nombre = $_POST["nombre"];
    $apellido = $_POST["apellido"];
    $puesto = $_POST["puesto"];
    $telefono = $_POST["telefono"];
    $estado = $_POST["estado"];
    $rol = $_POST["rol_id"];
    $usuario = $_POST["usuario"];
    $contrasena = $_POST["contrasena"];

    // Iniciar transacción
    $connection->beginTransaction();

    // 1. Insertar en la tabla empleado
    $sqlEmpleado = "INSERT INTO empleado (nombre, apellido, puesto, telefono, estado, rol_id) 
                    VALUES (:nombre, :apellido, :puesto, :telefono, :estado, :rol_id)";
    $stmtEmpleado = $connection->prepare($sqlEmpleado);
    $stmtEmpleado->execute([
        'nombre' => $nombre,
        'apellido' => $apellido,
        'puesto' => $puesto,
        'telefono' => $telefono,
        'estado' => $estado,
        'rol_id' => $rol
    ]);

    // Obtener el ID del empleado recién insertado
    $empleado_id = $connection->lastInsertId();

    // 2. Insertar en la tabla usuario
    $sqlUsuario = "INSERT INTO usuario (empleado_id, usuario, contraseña) 
                   VALUES (:empleado_id, :usuario, :contrasena)";
    $stmtUsuario = $connection->prepare($sqlUsuario);
    $stmtUsuario->execute([
        'empleado_id' => $empleado_id,
        'usuario' => $usuario,
        'contrasena' => $contrasena // Recomendable hashear la contraseña
    ]);

    // Confirmar la transacción
    $connection->commit();

    echo "Usuario registrado correctamente en ambas tablas";
} catch (PDOException $e) {
    // Revertir la transacción en caso de error
    $connection->rollBack();
    echo "Registro fallido: " . $e->getMessage();
}

$connection = null;
?>