<?php
include_once '../controller/ValidarSesion.php'
?>

<!doctype html>
<html lang="es">

<head>
    <title>Reportes</title>

    <meta charset="utf-8" />
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no" />

    <!-- Bootstrap CSS -->
    <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN"
        crossorigin="anonymous" />

    <!-- icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">

    <!-- CSS -->
    <link rel="stylesheet" href="../assets/css/components/sidebar.css">

    <link rel="stylesheet" href="../assets/css/pages/reportes.css">
</head>

<body>

    <div class="content-main d-flex">

        <!-- componente sidebar -->
        <?php include_once '../components/sidebar.php' ?>

        <main class="flex-grow-1">

            <header>
                <div class="info-section d-flex">
                    <i class="bi bi-journals"></i>
                    <h2>Reportes</h2>
                </div>

                <div class="description-section pb-4">
                    <p>Modulo de Reportes: Gestiona y valida los reportes de los rondines ealizados por tu equipo de seguridad. </p>
                </div>
            </header>


            <section class="reportes">
                <!-- Ejemplo de un reporte -->
                <div class="card reporte-card mb-4">
                    <div class="row g-0">
                        <!-- Columna izquierda - Datos del reporte -->
                        <div class="col-md-4 datos-reporte">
                            <div class="card-body">
                                <h5 class="card-title">Reporte #001</h5>
                                <p class="card-text"><strong>Nombre:</strong> Juan Pérez</p>
                                <p class="card-text"><strong>Fecha:</strong> 15/05/2023</p>
                                <p class="card-text"><strong>Ubicación:</strong> Edificio A</p>
                            </div>
                        </div>

                        <!-- Columna derecha - Observaciones -->
                        <div class="col-md-8 observaciones">
                            <div class="card-body">
                                <h6 class="card-subtitle mb-2 text-muted">Observaciones</h6>
                                <p class="card-text">Se encontró una puerta sin cerrar correctamente en el segundo piso. Se verificaron las cámaras de seguridad y no se detectó actividad sospechosa. Se procedió a cerrar y asegurar la puerta.</p>
                            </div>
                            <button class="btn btn-sm btn-primary mt-2">Ver detalles</button>
                        </div>
                    </div>
                </div>

                <!-- Otro reporte de ejemplo -->
                <div class="card reporte-card mb-4">
                    <div class="row g-0">
                        <div class="col-md-4 datos-reporte">
                            <div class="card-body">
                                <h5 class="card-title">Reporte #002</h5>
                                <p class="card-text"><strong>Nombre:</strong> María González</p>
                                <p class="card-text"><strong>Fecha:</strong> 16/05/2023</p>
                                <p class="card-text"><strong>Ubicación:</strong> Estacionamiento</p>
                            </div>
                        </div>

                        <div class="col-md-8 observaciones">
                            <div class="card-body">
                                <h6 class="card-subtitle mb-2 text-muted">Observaciones</h6>
                                <p class="card-text">Se identificó un vehículo con las luces encendidas por más de 2 horas. Se localizó al dueño (empleado del piso 3) quien fue notificado. No se encontraron daños o intentos de robo.</p>
                            </div>
                            <button class="btn btn-sm btn-primary mt-2">Ver detalles</button>
                        </div>
                    </div>
                </div>
            </section>


            <script src="../assets/js/components/sidebar.js"></script>

            <!-- Bootstrap JavaScript Libraries -->
            <script
                src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"
                integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r"
                crossorigin="anonymous"></script>

            <script
                src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.min.js"
                integrity="sha384-BBtl+eGJRgqQAUMxJ7pMwbEyER4l1g+O15P+16Ep7Q9Q+zqX6gSbd85u4mG4QzX+"
                crossorigin="anonymous"></script>

        </main>
    </div>
</body>

</html>