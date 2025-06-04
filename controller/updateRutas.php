<?php
require_once '../includes/dbConnection.php';

header('Content-Type: application/json');

// Verificar si 'id' está presente, ya que es fundamental para una actualización
if(isset($_POST['id'])) { // <--- Condición cambiada aquí
    $id = $_POST['id'];
    $nombre = $_POST['nombre'];
    $descripcion = $_POST['descripcion'];
    $hora_inicio = $_POST['hora_inicio'];
    $hora_fin = $_POST['hora_fin'];
    $estado = $_POST['estado'];
    
    // Las 'ubicaciones' desde JS son una cadena JSON, hay que decodificarlas
    $ubicaciones_json = isset($_POST['ubicaciones']) ? $_POST['ubicaciones'] : '[]';
    $ubicaciones = json_decode($ubicaciones_json, true); // Decodifica la cadena JSON a un array de PHP

    // Validación básica para campos requeridos
    if (empty($id) || empty($nombre) || empty($descripcion) || empty($hora_inicio) || empty($hora_fin) || empty($estado)) {
        echo json_encode(['success' => false, 'message' => 'Faltan campos obligatorios.']);
        exit; // Detiene la ejecución si faltan campos requeridos
    }

    try {
        $connection->beginTransaction();

        // Actualizar datos básicos de la ruta
        $stmt = $connection->prepare("UPDATE rondin SET nombre = ?, descripcion = ?, hora_inicio = ?, hora_fin = ?, estado = ? WHERE id_rondin = ?");
        $stmt->execute([$nombre, $descripcion, $hora_inicio, $hora_fin, $estado, $id]);

        // Eliminar relaciones anteriores
        $stmt = $connection->prepare("DELETE FROM rutas_rondin WHERE rondin_id = ?");
        $stmt->execute([$id]);

        // Insertar nuevas relaciones
        if(!empty($ubicaciones)) {
            // Asegúrate de que tu tabla 'ruta_ubicaciones' tenga una columna 'orden' si quieres guardar el orden
            $stmt = $connection->prepare("INSERT INTO rutas_rondin (rondin_id, ubicacion_id, orden) VALUES (?, ?, ?)");
            foreach($ubicaciones as $ubicacion) { // Itera sobre el array de objetos decodificado
                // Asegurarse de que 'id' y 'orden' existan en cada objeto de ubicación
                $ubicacion_id = $ubicacion['id'] ?? null;
                $orden = $ubicacion['orden'] ?? null;

                if ($ubicacion_id !== null && $orden !== null) {
                    $stmt->execute([$id, $ubicacion_id, $orden]);
                } else {
                    // Puedes registrar un error o manejarlo si falta 'id' o 'orden' para una ubicación
                    // Por ahora, simplemente lo saltaremos para evitar romper la transacción
                }
            }
        }
        
        $connection->commit();
        
        echo json_encode(['success' => true, 'message' => 'Ruta actualizada correctamente']);
        
    } catch(PDOException $e) {
        $connection->rollBack();
        echo json_encode(['success' => false, 'message' => 'Error al actualizar: ' . $e->getMessage()]);
    }
} else {
    // Este 'else' ahora se activará si el 'id' no está establecido
    echo json_encode(['success' => false, 'message' => 'Solicitud inválida: ID de ruta no proporcionado.']);
}
?>