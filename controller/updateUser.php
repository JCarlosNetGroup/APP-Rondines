<?php
require_once '../includes/dbConnection.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $id_empleado = $_POST['id_empleado'];
        $nombre = $_POST['nombre'];
        $apellido = $_POST['apellido'];
        $puesto = $_POST['puesto'];
        $telefono = $_POST['telefono'];
        $estado = $_POST['estado'];
        $rol_id = $_POST['rol_id'];
        $usuario = $_POST["usuario"];
        $contrasena = $_POST["contrasena"];

        // Iniciar transacción
        $connection->beginTransaction();

        // 1. Actualizar la tabla empleado
        $sqlEmpleado = "UPDATE empleado SET 
                        nombre = :nombre, 
                        apellido = :apellido, 
                        puesto = :puesto, 
                        telefono = :telefono, 
                        estado = :estado, 
                        rol_id = :rol_id 
                        WHERE id_empleado = :id_empleado";
        
        $stmtEmpleado = $connection->prepare($sqlEmpleado);
        $stmtEmpleado->execute([
            'nombre' => $nombre,
            'apellido' => $apellido,
            'puesto' => $puesto,
            'telefono' => $telefono,
            'estado' => $estado,
            'rol_id' => $rol_id,
            'id_empleado' => $id_empleado
        ]);

        // 2. Actualizar la tabla usuario
        $sqlUsuario = "UPDATE usuario SET 
                      usuario = :usuario, 
                      contraseña = :contrasena 
                      WHERE empleado_id = :id_empleado";
        
        $stmtUsuario = $connection->prepare($sqlUsuario);
        $stmtUsuario->execute([
            'usuario' => $usuario,
            'contrasena' => $contrasena,
            'id_empleado' => $id_empleado
        ]);

        // Confirmar la transacción
        $connection->commit();

        echo json_encode(['success' => true]);
        
    } catch (PDOException $e) {
        // Revertir la transacción en caso de error
        $connection->rollBack();
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }

    $connection = null;
} else {
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
}
?>