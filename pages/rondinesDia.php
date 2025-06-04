<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rondines Diarios</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../assets/css/pages/rondinesDia.css">
</head>

<body>
    <div class="container-fluid mobile-container">
        <!-- Encabezado -->
        <header class="sticky-top">
            <div class="row text-white py-3 align-items-center headerModule">
                <div class="col-2 text-end"></div>
                <div class="col-8 text-center">
                    <h1 class="h5 mb-0">Rondines</h1>
                </div>
                <div class="col-2">
                    <button id="menu-btn" class="btn btn-sm">
                        <i class="bi bi-list"></i>
                    </button>
                </div>
            </div>
        </header>

        <!-- Contenido principal -->
        <main>
            <div id="rondines-list" class="list-group">
                <!-- Los rondines se cargarán aquí dinámicamente -->
            </div>

            <div id="empty-state" class="text-center py-5 d-none">
                <i class="bi bi-inbox fs-1 text-muted"></i>
                <p class="text-muted">No hay rondines para mostrar</p>
            </div>
        </main>

    </div>

    <!-- Bootstrap JS Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">

    <script src="../assets/js/pages/rondinesDia.js"></script>
</body>

</html>