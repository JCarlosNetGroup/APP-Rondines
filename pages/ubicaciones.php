<?php
include_once '../controller/ValidarSesion.php';
?>

<!doctype html>
<html lang="es">

<head>
    <title>Ubicaciones</title>

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

    <link rel="stylesheet" href="../assets/css/pages/ubicaciones.css">
</head>

<body>

    <div class="content-main d-flex">

        <!-- componente sidebar -->
        <?php include_once '../components/sidebar.php' ?>

        <main class="flex-grow-1">

            <header>
                <div class="info-section d-flex">
                    <i class="bi bi-pin-map-fill"></i>
                    <h2>Ubicaciones</h2>
                </div>

                <div class="description-section pb-4">
                    <p>Modulo para la administracion de Ubicaciones</p>
                </div>
            </header>

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


            <!-- //* Modal "Agregar Ubicacion" -->

            <div class="modal fade" id="modalAddLocation" tabindex="-1" aria-labelledby="modalAddLocationLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="modalAddLocationLabel">
                                <i class="bi bi-geo-alt me-2"></i>Nueva Ubicación
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                        </div>

                        <form id="formAddLocation" method="post" enctype="multipart/form-data">
                            <div class="modal-body">

                                <!-- Campo Nombre -->
                                <div class="form-floating mb-3">
                                    <input type="text" class="form-control" id="nombre" name="nombre"
                                        placeholder=" " autocomplete="off" required>
                                    <label for="nombre">Nombre de Ubicación</label>
                                </div>

                                <!-- Campo Descripción -->
                                <div class="mb-3">
                                    <label for="descripcion" class="form-label">Descripción</label>
                                    <textarea class="form-control" id="descripcion" name="descripcion" rows="3"
                                        placeholder="Ej: Edificio de 3 pisos con entrada de cristal" required></textarea>
                                </div>

                                <!-- Card de Coordenadas -->
                                <div class="card mb-4">
                                    <div class="card-header bg-light text-center">
                                        <h6 class="card-title mb-0"><i class="bi bi-geo-fill me-2"></i>Coordenadas GPS</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="row g-3">
                                            <div class="col-md-6">
                                                <div class="form-floating">
                                                    <input type="number" step="any" class="form-control"
                                                        id="latitud" name="latitud" placeholder=" " required>
                                                    <label for="latitud">Latitud</label>
                                                </div>
                                                <div class="form-text ms-2">Ej: 19.4326077 (México City)</div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="form-floating">
                                                    <input type="number" step="any" class="form-control"
                                                        id="longitud" name="longitud" placeholder=" " required>
                                                    <label for="longitud">Longitud</label>
                                                </div>
                                                <div class="form-text ms-2">Ej: -99.133208 (México City)</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Campo de Estado -->
                                <div class="mb-4">
                                    <label for="status" class="form-label">Estado</label>
                                    <select class="form-select" id="status" name="estado" required>
                                        <option value="">Selecciona la disponibilidad de la ubicación</option>
                                        <option value="activa">Activa</option>
                                        <option value="Suspendida">Suspendida (Sin Acceso)</option>
                                        <option value="Bloqueada">Bloqueada (Deshabilitada)</option>
                                    </select>
                                </div>
                            </div>

                            <div class="modal-footer bg-light">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    <i class="bi bi-x-lg me-2"></i>Cancelar
                                </button>
                                <button type="submit" name="enviar" class="btn btnModal">
                                    <i class="bi bi-check-circle me-2"></i>Guardar Ubicación
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>


            <!-- //*Declaracion de Modal Editar Ubicacion -->

            <div class="modal fade" id="editLocation" tabindex="-1" aria-labelledby="editLocationLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="editLocationLabel"><i class="bi bi-geo-alt me-2"></i>Editar Ubicación</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                        </div>

                        <form id="formEditLocation">
                            <div class="modal-body">
                                <input type="hidden" id="edit-id" name="id">

                                <div class="row g-3">

                                    <div class="col-md-6">

                                        <!-- Card de Nombre -->
                                        <div class="card mb-3">
                                            <div class="card-header bg-light text-center py-2">
                                                <h6 class="card-title mb-0">Nombre</h6>
                                            </div>
                                            <div class="card-body">
                                                <div class="form-floating">
                                                    <input type="text" class="form-control" id="edit-nombre" name="nombre" placeholder="Nombre" required>
                                                    <label for="edit-nombre">Nombre de la ubicación</label>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Card de Descripción -->
                                        <div class="card mb-3">
                                            <div class="card-header bg-light text-center py-2">
                                                <h6 class="card-title mb-0">Descripción</h6>
                                            </div>
                                            <div class="card-body">
                                                <textarea class="form-control" id="edit-descripcion" name="descripcion" rows="3" placeholder="Agrega una descripción detallada..."></textarea>
                                            </div>
                                        </div>

                                        <!-- Card de Estado -->
                                        <div class="card">
                                            <div class="card-header bg-light text-center py-2">
                                                <h6 class="card-title mb-0">Estado</h6>
                                            </div>
                                            <div class="card-body">
                                                <select class="form-select" id="edit-estado" name="estado" required>
                                                    <option value="">Selecciona el estado</option>
                                                    <option value="Activa">Activa</option>
                                                    <option value="Suspendida">Suspendida</option>
                                                    <option value="Bloqueada">Bloqueada</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="col-md-6">

                                        <!-- Card de Coordenadas (Latitud/Longitud) -->
                                        <div class="card mb-3">
                                            <div class="card-header bg-light text-center py-2">
                                                <h6 class="card-title mb-0">Coordenadas</h6>
                                            </div>
                                            <div class="card-body">
                                                <div class="row g-2">
                                                    <div class="col-md-6">
                                                        <div class="form-floating">
                                                            <input type="number" step="any" class="form-control" id="edit-latitud" name="latitud" placeholder="Latitud" required>
                                                            <label for="edit-latitud">Latitud</label>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-6">
                                                        <div class="form-floating">
                                                            <input type="number" step="any" class="form-control" id="edit-longitud" name="longitud" placeholder="Longitud" required>
                                                            <label for="edit-longitud">Longitud</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- card de QR -->
                                        <div class="card">
                                            <div class="card-header bg-light text-center py-2">
                                                <h6 class="card-title mb-0">Código QR</h6>
                                            </div>
                                            <div class="card-body d-flex flex-column">

                                                <div id="qrPreview" class="flex-grow-1 d-flex align-items-center justify-content-center mb-3" style="width: 170px; height: 155px; margin: 0 auto;">
                                                    <!-- QR se renderizará aquí -->
                                                </div>

                                                <div class="text-center">
                                                    <button type="button" id="downloadQR" class="btn">
                                                        <i class="bi bi-download me-2"></i>Descargar QR
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                </div>
                            </div>


                            <div class="modal-footer bg-light">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    <i class="bi bi-x-circle me-2"></i>Cancelar
                                </button>
                                <button type="submit" class="btn btnModal">
                                    <i class="bi bi-save me-2"></i>Guardar Cambios
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>

            <!-- Declaracion de la tabla de usuarios -->

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



            <!-- script-componente-sidebar -->
            <script src="../assets/js/components/sidebar.js"></script>

            <script src="../assets/js/pages/ubicaciones.js"></script>

            <!-- sweetAlert2 -->
            <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

            <!-- qrCode -->
            <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js"></script>

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