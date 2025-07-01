<?php
session_start();
require_once '../includes/dbConnection.php';

header('Content-Type: application/json');

// Verificar que todos los campos requeridos están presentes
$requiredFields = ['nombre', 'apellido', 'puesto', 'telefono', 'estado', 'rol_id', 'usuario', 'contrasena'];
foreach ($requiredFields as $field) {
    if (empty($_POST[$field])) {
        echo json_encode(['success' => false, 'message' => 'El campo ' . $field . ' es requerido']);
        exit;
    }
}

try {
    $nombre = $_POST["nombre"];
    $apellido = $_POST["apellido"];
    $puesto = $_POST["puesto"];
    $telefono = $_POST["telefono"];
    $estado = $_POST["estado"];
    $rol = $_POST["rol_id"];
    $usuario = $_POST["usuario"];
    $contrasena = $_POST["contrasena"];

    // Validaciones adicionales
    if ($rol === false) {
        echo json_encode(['success' => false, 'message' => 'El rol seleccionado no es válido']);
        exit;
    }

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

    // 2. Insertar en la tabla usuario (ahora con contraseña en texto plano)
    $sqlUsuario = "INSERT INTO usuario (empleado_id, usuario, contraseña) 
                   VALUES (:empleado_id, :usuario, :contrasena)";
    $stmtUsuario = $connection->prepare($sqlUsuario);
    $stmtUsuario->execute([
        'empleado_id' => $empleado_id,
        'usuario' => $usuario,
        'contrasena' => $contrasena
    ]);

    // Confirmar la transacción
    $connection->commit();

    echo json_encode(['success' => true, 'message' => 'Usuario registrado correctamente']);
} catch (PDOException $e) {
    // Revertir la transacción en caso de error
    $connection->rollBack();
    echo json_encode(['success' => false, 'message' => 'Error en el registro: ' . $e->getMessage()]);
} finally {
    $connection = null;
}
?>