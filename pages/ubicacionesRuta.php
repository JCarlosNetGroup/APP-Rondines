<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ubicaciones de Ruta</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../assets/css/pages/ubicacionesRuta.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
</head>

<body>
    <div class="container-fluid mobile-container">
        <!-- Encabezado -->
        <header class="sticky-top">
            <div class="row text-white py-3 align-items-center headerModule">
                <div class="col-2">
                    <!-- Espacio reservado para alinear -->
                </div>
                <div class="col-8 text-center">
                    <h1 class="h5 mb-0">Ubicaciones de Ruta</h1>
                </div>
                <div class="col-2 text-end">
                    <button id="back-btn" class="btn btn-sm">
                        <i class="bi bi-caret-left-fill"></i>
                    </button>
                </div>
            </div>
        </header>

        <!-- Contenido principal -->
        <main>
            <div id="ubicaciones-list" class="list-group">
                <!-- Las ubicaciones se cargarán aquí dinámicamente -->
            </div>

            <div id="empty-state" class="text-center py-5 d-none">
                <i class="bi bi-inbox fs-1 text-muted"></i>
                <p class="text-muted">No hay ubicaciones para mostrar</p>
            </div>
        </main>
    </div>

    <!-- Bootstrap JS Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

    <script src="../assets/js/pages/ubicacionesRuta.js"></script>
</body>

</html>