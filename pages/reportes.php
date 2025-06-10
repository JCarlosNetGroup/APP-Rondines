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


            <!-- aqui se declara la tabla de reportes  -->

             <!-- Boton "Nuevo Ubicacion y cuadro de busqueda -->

            <div class="d-flex justify-content-end align-items-center pt-1 pb-3 gap-3">
                <div class="d-flex align-items-center gap-2">
                    <label for="selectEstado" class="mb-0">Estado:</label>
                    <select id="selectEstado" class="form-select form-select-sm">
                        <!-- <option value="">Todos</option> -->
                        <option value="Activa">Activa</option>
                        <option value="Suspendida">Suspendida</option>
                        <option value="Bloqueada">Bloqueada</option>
                    </select>

                    <label for="inputBusqueda" class="mb-0">Buscar:</label>
                    <input type="search" id="inputBusqueda" class="inputsearch">
                </div>

                <button class="btn iconModal px-1 py-0" data-bs-toggle="modal" data-bs-target="#modalAddLocation" title="Agregar Ubicación">
                    <i class="bi bi-plus-square-fill"></i>
                </button>
            </div>

            <div class="row py-4">
                <div class="col">
                    <table class="table table-sm table-striped table-hover" id="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Latitud</th>
                                <th>Longitud</th>
                                <th>Estado</th>
                                <th>Editar</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>


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