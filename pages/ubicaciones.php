<?php
session_start();
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

            <div class="d-flex justify-content-between align-items-center pt-1 pb-3">
                <div class="d-flex align-items-center gap-2">
                    <label for="inputBusqueda" class="mb-0">Buscar:</label>
                    <input type="search" id="inputBusqueda" class="inputsearch">
                </div>
                <button class="btn btn-sm btnModal" data-bs-toggle="modal" data-bs-target="#modalAddLocation">Nueva Ubicacion</button>
            </div>


            <!-- //* Modal "Agregar Ubicacion" -->

            <div class="modal fade" id="modalAddLocation" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Nueva Ubicación</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form class="formModal" id="formAddLocation" method="post" enctype="multipart/form-data">
                            <div class="modal-body">

                                <div class="form-floating mb-3">
                                    <input class="form-control" type="text" id="nombre" name="nombre" autocomplete="off" placeholder="" required>
                                    <label for="nombre" class="form-label">Nombre de Ubicación</label>
                                </div>

                                <div class="mb-3">
                                    <textarea class="form-control" rows="3" id="descripcion" name="descripcion" autocomplete="off" placeholder="Agrega una descripcion" required></textarea>
                                </div>

                                <div class="form-floating mb-3">
                                    <input class="form-control" type="text" id="latitud" name="latitud" autocomplete="off" placeholder="" required>
                                    <label for="latitud" class="form-label">Latitud</label>
                                </div>

                                <div class="form-floating mb-3">
                                    <input class="form-control" type="text" id="longitud" name="longitud" autocomplete="off" placeholder="" required>
                                    <label for="longitud" class="form-label">Longitud</label>
                                </div>

                                <div class="mb-3">
                                    <label for="status" class="form-label">Estado</label>
                                    <select class="form-select" id="status" name="estado" required>
                                        <option value="">Selecciona el Estado</option>
                                        <option value="activa">Activa</option>
                                        <option value="Suspendida">Suspendida</option>
                                        <option value="Bloqueada">Bloqueada</option>
                                    </select>
                                </div>

                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                                <button type="submit" name="enviar" class="btn btnModal">Agregar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>


            <!-- //*Declaracion de Modal Editar Ubicacion -->

            <!-- Reemplazar el modal de edición de usuario por uno para ubicaciones -->
            <!-- <div class="modal fade" id="editLocation" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Editar Ubicación</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form id="formEditLocation">
                            <div class="modal-body">
                                <input type="hidden" id="edit-id" name="id">

                                <div class="form-floating mb-3">
                                    <input class="form-control" type="text" id="edit-nombre" name="nombre" required>
                                    <label for="edit-nombre">Nombre</label>
                                </div>

                                <div class="form-floating mb-3">
                                    <input class="form-control" type="number" step="any" id="edit-latitud" name="latitud" required>
                                    <label for="edit-latitud">Latitud</label>
                                </div>

                                <div class="form-floating mb-3">
                                    <input class="form-control" type="number" step="any" id="edit-longitud" name="longitud" required>
                                    <label for="edit-longitud">Longitud</label>
                                </div>

                                <div class="mb-3">
                                    <label for="edit-estado" class="form-label">Estado</label>
                                    <select class="form-select" id="edit-estado" name="estado" required>
                                        <option value="">Selecciona el Estado</option>
                                        <option value="activa">Activa</option>
                                        <option value="Suspendida">Suspendida</option>
                                        <option value="Bloqueada">Bloqueada</option>
                                    </select>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="submit" class="btn btn-primary">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div> -->

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
</body>

</html>