<?php
include_once '../controller/ValidarSesion.php';
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rondines Diarios</title>

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">

    <!-- SweetAlert2 CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">

    <!-- CSS personalizado -->
    <link rel="stylesheet" href="../assets/css/pages/rondinesDia.css">
</head>

<body>
    <div class="container-fluid mobile-container p-0">

        <header class="sticky-top">
            <div class="container-fluid px-0">
                <div class="row text-white py-3 align-items-center headerModule mx-0">
                    <div class="col-2 text-start ps-3">
                        <!-- Espacio para posible botón de retroceso -->
                    </div>
                    <div class="col-8 text-center">
                        <h1 class="h5 mb-0">Rondines Disponibles</h1>
                    </div>
                    <div class="col-2 text-end pe-3">
                        <button id="menu-btn" class="btn btn-sm border-light bg-transparent rounded-3 p-1" type="button">
                            <i class="bi bi-list" style="font-size: 1.3rem;"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Menú desplegable móvil -->
            <div id="mobile-menu" class="mobile-menu-container">
                <div class="mobile-menu-content pt-2">
                    <div class="user-info text-center">
                        <?php
                        if (isset($_SESSION['usuario'])) {
                            echo '<div class="user-name">' . $_SESSION['nombre'] . ' ' . $_SESSION['apellido'] . '</div>';
                        }
                        ?>
                    </div>
                    <div class="menu-items-top pt-3">
                        <a href="mobileDash.php" class="mobile-menu-item">
                            <i class="bi bi-megaphone me-2"></i> Comunicados
                        </a>
                        <a href="rondinesDia.php" class="mobile-menu-item active">
                            <i class="bi bi-check-circle me-2"></i> Rondines Disponibles
                        </a>
                        <div class="menu-items-bottom">
                            <a href="../controller/logout.php" class="mobile-menu-item logout-item">
                                <i class="bi bi-box-arrow-left me-2"></i> Cerrar Sesión
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div id="menu-overlay" class="menu-overlay"></div>
        </header>

        <main>
            
            <div id="rondines-list" class="list-group list-group-flush rounded-0">
                <!-- Contenedor de carga dinámica lista de rondines -->
            </div>

            <div id="empty-state" class="text-center py-5 d-none">
                <i class="bi bi-inbox fs-1 text-muted"></i>
                <p class="text-muted">No hay rondines para mostrar</p>
            </div>
        </main>

    </div>

    <!-- Bootstrap JS Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

    <!-- SweetAlert2 JS -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    <!-- Script rondinesDia -->
    <script src="../assets/js/pages/rondinesDia.js"></script>

</body>

</html>