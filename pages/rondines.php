<?php
include_once '../controller/ValidarSesion.php'
?>

<!doctype html>
<html lang="es">

<head>
    <title>Rondines</title>

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

    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossorigin="" />

    <!-- Leaflet JS -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossorigin=""></script>

    <!-- CSS -->
    <link rel="stylesheet" href="../assets/css/components/sidebar.css">

    <link rel="stylesheet" href="../assets/css/pages/rondines.css">
</head>

<body>

    <div class="content-main d-flex">

        <!-- componente sidebar -->
        <?php include_once '../components/sidebar.php' ?>

        <main class="flex-grow-1">

            <header>
                <div class="info-section d-flex">
                    <i class="bi bi-repeat"></i>
                    <h2>Rondines</h2>
                </div>

                <div class="description-section pb-4">
                    <p>Modulo de Rondines. Gestiona y administra las rutas</p>
                </div>
            </header>

            <div class="container-fluid">

                <div class="d-flex justify-content-between align-items-center pt-1 pb-3">
                    <div class="d-flex align-items-center gap-2">
                        <label for="selectEstadoRondin" class="mb-0">Estado:</label>
                        <select id="selectEstadoRondin" class="form-select form-select-sm">
                            <option value="">Todos</option>
                            <option value="Activa" selected>Activa</option>
                            <option value="Suspendida">Suspendida</option>
                            <option value="Bloqueada">Bloqueada</option>
                        </select>

                        <label for="inputBusquedaRondin" class="mb-0">Buscar:</label>
                        <input type="search" id="inputBusquedaRondin" class="inputsearch">
                    </div>
                    <button class="btn btnModal" data-bs-toggle="modal" data-bs-target="#addRuta">
                        Crear Nueva Ruta
                    </button>
                </div>
                <!-- Tabla completa ancho -->
                <div class="row d-flex justify-content-center mb-5">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body p-0">
                                <div class="table-responsive">
                                    <table class="table table-sm table-striped table-hover mb-0" id="data-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Nombre</th>
                                                <!-- <th>Descripción</th> -->
                                                <th>Hora-Inicio</th>
                                                <th>Hora-Fin</th>
                                                <th>Estado</th>
                                                <th>Editar</th>
                                            </tr>
                                        </thead>
                                        <tbody></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Mapa completo ancho -->
                <div class="row">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header map-header text-white">
                                <h5 class="mb-0">NETWORKS</h5>
                            </div>
                            <div class="card-body p-0">
                                <div id="map" style="height: 600px; width: 100%;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <!-- //* Modal "Agregar Ruta del Rondin" -->

            <div class="modal fade" id="addRuta" tabindex="-1" aria-labelledby="addRutaLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="addRutaLabel">
                                <i class="bi bi-signpost-2 me-2"></i>Nueva Ruta
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                        </div>

                        <form id="formAddRuta" method="post" enctype="multipart/form-data">
                            <div class="modal-body">
                                <div class="row">
                                    <!-- Columna de formulario principal -->
                                    <div class="col-md-6">

                                        <!-- Campo Nombre -->
                                        <div class="form-floating mb-3">
                                            <input type="text" class="form-control" id="nombreRuta" name="nombre"
                                                placeholder=" " autocomplete="off" required>
                                            <label for="nombreRuta">Nombre de la Ruta</label>
                                        </div>

                                        <!-- Campo Descripción -->
                                        <div class="mb-3">
                                            <label for="descripcionRuta" class="form-label">Descripción</label>
                                            <textarea class="form-control" id="descripcionRuta" name="descripcion" rows="3"
                                                placeholder="Ej: Ruta de caseta oriente a poninete" required></textarea>
                                        </div>

                                        <!-- Card de Horarios -->
                                        <div class="card mb-3">
                                            <div class="card-header d-flex justify-content-center">
                                                <h6 class="card-title mb-0"><i class="bi bi-clock me-2"></i>Horarios</h6>
                                            </div>
                                            <div class="card-body">
                                                <div class="row d-flex justify-content-evenly">
                                                    <div class="col-md-5">
                                                        <div class="form-floating">
                                                            <input type="time" class="form-control" id="inicioRuta"
                                                                name="hora_inicio" required>
                                                            <label for="inicioRuta">Hora de Inicio</label>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-5">
                                                        <div class="form-floating">
                                                            <input type="time" class="form-control" id="finRuta"
                                                                name="hora_fin" required>
                                                            <label for="finRuta">Hora de Fin</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Campo de Estado -->
                                        <div class="mb-3">
                                            <label for="estadoRuta" class="form-label">Estado</label>
                                            <select class="form-select" id="estadoRuta" name="estado" required>
                                                <option value="">Selecciona el estado de la ruta</option>
                                                <option value="activa">Activa</option>
                                                <option value="Suspendida">Suspendida (Sin Acceso)</option>
                                                <option value="Bloqueada">Bloqueada (Deshabilitada)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <!-- Columna de ubicaciones -->
                                    <div class="col-md-6">
                                        <div class="card h-100">
                                            <div class="card-header d-flex justify-content-center">
                                                <h6 class="card-title mb-0"><i class="bi bi-geo-alt me-2"></i>Ubicaciones</h6>

                                            </div>
                                            <div class="card-body p-0">
                                                <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
                                                    <table class="table table-hover table-striped text-center mb-0">
                                                        <thead class="sticky-top">
                                                            <tr>
                                                                <th width="50px"></th>
                                                                <th>Nombre</th>
                                                                <th>Estado</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody id="ubicaciones-list">
                                                            <!-- Las ubicaciones se cargarán aquí dinámicamente -->
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="modal-footer bg-light">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    <i class="bi bi-x-lg me-2"></i>Cancelar
                                </button>
                                <button type="submit" name="enviar" class="btn btnModal">
                                    <i class="bi bi-check-circle me-2"></i>Guardar Ruta
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>


            <!-- //* Modal "Editar ruta de Rondin" -->

            <div class="modal fade" id="editRuta" tabindex="-1" aria-labelledby="editRutaLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="editRutaLabel">
                                <i class="bi bi-pencil-square me-2"></i>Editar Ruta
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                        </div>

                        <form id="formEditRuta" method="post" enctype="multipart/form-data">
                            <div class="modal-body">
                                <input type="hidden" id="edit_idRuta" name="id">
                                <div class="row">

                                    <!-- Columna de formulario principal -->
                                    <div class="col-md-6">

                                        <!-- Campo Nombre -->
                                        <div class="form-floating mb-3">
                                            <input type="text" class="form-control" id="edit_nombreRuta" name="nombre"
                                                placeholder=" " autocomplete="off" required>
                                            <label for="edit_nombreRuta">Nombre de la Ruta</label>
                                        </div>

                                        <!-- Campo Descripción -->
                                        <div class="mb-3">
                                            <label for="edit_descripcionRuta" class="form-label">Descripción</label>
                                            <textarea class="form-control" id="edit_descripcionRuta" name="descripcion" rows="3"
                                                placeholder="Ej: Ruta de caseta oriente a poninete" required></textarea>
                                        </div>

                                        <!-- Card de Horarios -->
                                        <div class="card mb-3">
                                            <div class="card-header d-flex justify-content-center">
                                                <h6 class="card-title mb-0"><i class="bi bi-clock me-2"></i>Horarios</h6>
                                            </div>
                                            <div class="card-body">
                                                <div class="row d-flex justify-content-evenly">
                                                    <div class="col-md-5">
                                                        <div class="form-floating">
                                                            <input type="time" class="form-control" id="edit_inicioRuta"
                                                                name="hora_inicio" required>
                                                            <label for="edit_inicioRuta">Hora de Inicio</label>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-5">
                                                        <div class="form-floating">
                                                            <input type="time" class="form-control" id="edit_finRuta"
                                                                name="hora_fin" required>
                                                            <label for="edit_finRuta">Hora de Fin</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Campo de Estado -->
                                        <div class="mb-3">
                                            <label for="edit_estadoRuta" class="form-label">Estado</label>
                                            <select class="form-select" id="edit_estadoRuta" name="estado" required>
                                                <option value="">Selecciona el estado de la ruta</option>
                                                <option value="activa">Activa</option>
                                                <option value="Suspendida">Suspendida (Sin Acceso)</option>
                                                <option value="Bloqueada">Bloqueada (Deshabilitada)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <!-- Columna de ubicaciones -->
                                    <div class="col-md-6">
                                        <div class="card h-100">
                                            <div class="card-header d-flex justify-content-center">
                                                <h6 class="card-title mb-0"><i class="bi bi-geo-alt me-2"></i>Ubicaciones</h6>
                                            </div>
                                            <div class="card-body p-0">
                                                <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
                                                    <table class="table table-hover table-striped text-center mb-0">
                                                        <thead class="sticky-top">
                                                            <tr>
                                                                <th width="50px"></th>
                                                                <th>Nombre</th>
                                                                <th>Estado</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody id="edit_ubicaciones-list">
                                                            <!-- Las ubicaciones se cargarán aquí dinámicamente -->
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="modal-footer bg-light">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    <i class="bi bi-x-lg me-2"></i>Cancelar
                                </button>
                                <button type="submit" name="actualizar" class="btn btnModal">
                                    <i class="bi bi-check-circle me-2"></i>Actualizar Ruta
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <script src="../assets/js/components/sidebar.js"></script>
            <script src="../assets/js/pages/rondines.js"></script>

            <!-- sweetalert2 -->
            <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

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