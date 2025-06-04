<?php
require_once '../includes/dbConnection.php';
header('Content-Type: application/json');

set_time_limit(30);
ini_set('memory_limit', '128M');

try {
    // Obtener parámetros de filtrado
    $searchTerm = isset($_GET['search']) ? $_GET['search'] : '';
    $estadoFiltro = isset($_GET['estado']) ? $_GET['estado'] : '';
    $searchWords = $searchTerm ? explode(' ', $searchTerm) : [];

    // Consulta SQL base
    $query = "SELECT
                id_rondin,
                nombre,
                descripcion,
                estado,
                DATE_FORMAT(hora_inicio, '%H:%i') as hora_inicio,
                DATE_FORMAT(hora_fin, '%H:%i') as hora_fin      
              FROM rondin";

    // Array para condiciones WHERE
    $conditions = [];

    // Lógica para el filtro de estado:
    // - Primera carga (no parámetro estado): mostrar solo Activas
    // - Estado vacío (seleccionó "Todos"): mostrar todos
    // - Estado específico: filtrar por ese estado
    if ($estadoFiltro === '' && !isset($_GET['estado'])) {
        // Primera carga - mostrar solo Activas
        $conditions[] = "estado = 'Activa'";
    } elseif ($estadoFiltro !== '') {
        // Estado específico seleccionado
        $conditions[] = "estado = :estadoFiltro";
    }
    // Si $estadoFiltro es '' pero se envió el parámetro (seleccionó "Todos"), no filtramos

    // Búsqueda por término
    if (!empty($searchWords)) {
        $searchConditions = [];
        foreach ($searchWords as $index => $word) {
            $param = ":searchWord{$index}";
            $searchConditions[] = "(nombre LIKE {$param} OR descripcion LIKE {$param} OR estado LIKE {$param})";
            $searchWords[$index] = "%{$word}%";
        }
        $conditions[] = "(" . implode(' AND ', $searchConditions) . ")";
    }

    // Aplicar condiciones WHERE si existen
    if (!empty($conditions)) {
        $query .= " WHERE " . implode(' AND ', $conditions);
    }

    $stmt = $connection->prepare($query);

    // Bind parameters
    if ($estadoFiltro !== '' && isset($_GET['estado'])) {
        $stmt->bindParam(':estadoFiltro', $estadoFiltro, PDO::PARAM_STR);
    }

    if (!empty($searchWords)) {
        foreach ($searchWords as $index => $word) {
            $stmt->bindValue(":searchWord{$index}", $word, PDO::PARAM_STR);
        }
    }

    $stmt->execute();
    $rutas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($rutas)) {
        echo json_encode([
            'success' => true,
            'message' => 'No hay rutas registradas',
            'rutas' => []
        ]);
        exit;
    }

    // Para cada ruta, obtener sus ubicaciones en orden
    foreach ($rutas as &$ruta) {
        $queryUbicaciones = "SELECT
                rr.orden,
                u.nombre AS nombre, 
                u.id_ubicacion AS id,
                u.descripcion AS descripcion, 
                u.latitud,
                u.longitud
            FROM rutas_rondin rr
            JOIN ubicacion u ON rr.ubicacion_id = u.id_ubicacion
            WHERE rr.rondin_id = :id_rondin
            ORDER BY rr.orden";

        $stmtUbicaciones = $connection->prepare($queryUbicaciones);
        $stmtUbicaciones->bindParam(':id_rondin', $ruta['id_rondin'], PDO::PARAM_INT);
        $stmtUbicaciones->execute();

        $ruta['ubicaciones'] = $stmtUbicaciones->fetchAll(PDO::FETCH_ASSOC);
    }
    unset($ruta);

    echo json_encode([
        'success' => true,
        'rutas' => $rutas
    ]);
} catch (PDOException $e) {
    error_log("Error en getRutas.php (PDO): " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error al cargar las rutas. Por favor, intente más tarde.',
        'error' => $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("Error en getRutas.php (General): " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Ocurrió un error inesperado.',
        'error' => $e->getMessage()
    ]);
}