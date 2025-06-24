<?php
include_once '../controller/ValidarSesion.php';
?>

<!doctype html>
<html lang="es">

<head>
    <title>Dashboard</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />

    <!-- icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">

    <!-- CSS -->
    <link rel="stylesheet" href="../assets/css/pages/mobiledash.css">
</head>

<body>

    <div class="content-main">

        <main">

            <header class="sticky-top">
                <div class="container-fluid px-0">
                    <div class="row text-white py-3 align-items-center headerModule mx-0">
                        <div class="col-2 text-start ps-3">
                            <!-- Espacio para posible botón de retroceso -->
                        </div>
                        <div class="col-8 text-center">
                            <h1 class="h5 mb-0">Comunicados</h1>
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

            <!-- Sección Comunicado principal -->
            <section>

                <article class="comunicado card shadow-sm border-0 mb-3">
                    <div class="card-body">
                        <header>
                            <h5 class="card-title h6"></h5>
                        </header>

                        <div class="contenido-comunicado py-2">
                            <div class="row align-items-center">
                                <div class="col-12 mb-3">
                                    <img src="../assets/images/descarga.jpeg"
                                        alt="Imagen relacionada con el comunicado"
                                        class="img-fluid rounded shadow-sm w-100"
                                        style="max-height: 200px; object-fit: cover;">
                                </div>
                                <div class="col-12">
                                    <p class="card-text descripcion-comunicado small">
                                        Breve descripción o resumen del comunicado para dar contexto.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <footer class="d-flex justify-content-between align-items-center pt-3 border-top mt-3">
                            <span class="fechaComunicado text-muted small">Publicado: <span class="fw-semibold">fecha</span></span>
                            <span class="badge bg-secondary mb-2">Nuevo</span>
                        </footer>
                    </div>
                </article>
            </section>

            <!-- Sección histórico de comunicados -->
            <section class="py-3 text-center" id="comunicados-section">
                <h4 class="h5 mb-3 pb-2 border-bottom">Comunicados anteriores</h4>

                <div class="row g-3" id="comunicados-container">
                    <!-- Los comunicados se cargarán aquí dinámicamente -->
                </div>

                <!-- Paginación -->
                <nav class="mt-3">
                    <ul class="pagination justify-content-center" id="pagination-container">
                        <!-- La paginación se generará dinámicamente -->
                    </ul>
                </nav>
            </section>
            </main>
    </div>

    <!-- Bootstrap JavaScript Libraries -->
    <script
        src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"
        integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r"
        crossorigin="anonymous"></script>

    <script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.min.js"
        integrity="sha384-BBtl+eGJRgqQAUMxJ7pMwbEyER4l1g+O15P+16Ep7Q9Q+zqX6gSbd85u4mG4QzX+"
        crossorigin="anonymous"></script>

    <!-- JavaScript simplificado para móvil -->
    <script src="../assets/js/pages/dashboard-mobile.js"></script>
</body>

</html>