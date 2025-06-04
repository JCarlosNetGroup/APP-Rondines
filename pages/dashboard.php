<?php
include_once '../controller/ValidarSesion.php';
?>

<!doctype html>
<html lang="es">

<head>
    <title>Dashboard</title>

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

    <link rel="stylesheet" href="../assets/css/pages/dashboard.css">
</head>

<body>

    <div class="content-main d-flex">

        <!-- componente sidebar -->
        <?php include_once '../components/sidebar.php' ?>

        <main class="flex-grow-1">

            <header>
                <div class="info-section d-flex">
                    <i class="bi bi-grid-1x2-fill"></i>
                    <h2>Dashboard</h2>
                </div>

                <div class="description-section py-2">
                    <p>Modulo de Comunicados</p>
                </div>
            </header>

            <!-- Boton publicar comunicado -->

            <div class="col-md-9 content-button d-flex justify-content-start pt-1 pb-4">
                <button class="btn btn btnModal" data-bs-toggle="modal" data-bs-target="#miModal">Publicar Comunicado</button>
            </div>

            <!-- Sección Comunicado principal y lista de ruta diaria -->
            <section class="d-flex justify-content-between gap-4">

                <!-- Comunicado principal - Tarjeta más visual -->
                <article class="col-md-8 comunicado card shadow-sm border-0">
                    <div class="card-body">
                        <header>
                            <h5 class="card-title text-primary fw-bold">Título del Comunicado</h5>
                            <span class="badge bg-secondary mb-2">Nuevo</span>
                        </header>

                        <div class="contenido-comunicado py-2">
                            <div class="row align-items-center">
                                <div class="col-md-6">
                                    <p class="card-text descripcion-comunicado">Breve descripción o resumen del comunicado para dar contexto.</p>
                                    <div class="d-flex mt-4">
                                        <button class="btn btn-outline-primary btn-sm">Leer más</button>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <img src="../assets/images/descarga.jpeg"
                                        alt="Imagen relacionada con el comunicado"
                                        class="img-fluid rounded shadow-sm"
                                        style="max-height: 200px; width: 100%; object-fit: cover;">
                                </div>
                            </div>
                        </div>

                        <footer class="d-flex justify-content-between align-items-center pt-3 border-top mt-3">
                            <span class="fechaComunicado text-muted small">Publicado: <span class="fw-semibold">fecha</span></span>
                            <button class="btn btn-outline-secondary btn-sm" data-bs-toggle="modal" data-bs-target="#editarModal">
                                <i class="bi bi-pencil-square"></i> Editar
                            </button>
                        </footer>
                    </div>
                </article>

                <!-- Aside más estilizado -->
                <aside class="col-md-3 listaRutas card shadow-sm border-0 h-100">
                    <div class="card-body">
                        <h6 class="card-title fw-bold mb-3">Rutas del día</h6>
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item d-flex justify-content-between align-items-start border-0 px-0">
                                <div class="ms-2 me-auto">
                                    <div class="fw-semibold">Ruta Norte</div>
                                    <small class="text-muted">8:00 - 12:00</small>
                                </div>
                                <span class="badge bg-primary rounded-pill">3</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between align-items-start border-0 px-0">
                                <div class="ms-2 me-auto">
                                    <div class="fw-semibold">Ruta Sur</div>
                                    <small class="text-muted">13:00 - 17:00</small>
                                </div>
                                <span class="badge bg-primary rounded-pill">5</span>
                            </li>
                        </ul>
                    </div>
                </aside>

            </section>

            <!-- //* Seccion histoial de comunicados -->


            <section class="py-4" id="comunicados-section">
                <h4 class="mb-4 pb-2 border-bottom">Comunicados anteriores</h4>

                <div class="row g-4" id="comunicados-container">
                    <!-- Los comunicados se cargarán aquí dinámicamente -->
                </div>

                <!-- Paginación -->
                <nav class="mt-4">
                    <ul class="pagination justify-content-center" id="pagination-container">
                        <!-- La paginación se generará dinámicamente -->
                    </ul>
                </nav>
            </section>

        </main>

    </div>

    <!-- //* Modal "Publicar Cominicado" -->

    <div class="modal fade" id="miModal" tabindex="-1" aria-labelledby="miModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="miModalLabel"><i class="bi bi-megaphone me-2"></i>Nuevo Comunicado</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>

                <form class="formulario" method="post" action="" id="formComunicado" enctype="multipart/form-data">
                    <div class="modal-body">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <!-- Card de Título -->
                                <div class="card mb-3">
                                    <div class="card-header bg-light text-center py-2">
                                        <h6 class="card-title mb-0">Título</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="form-floating">
                                            <input class="form-control" type="text" id="agregarTitulo" name="titulo" autocomplete="off" placeholder="Título del comunicado" required>
                                            <label for="agregarTitulo">Título del comunicado</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <!-- Card de Archivo -->
                                <div class="card mb-3">
                                    <div class="card-header bg-light text-center py-2">
                                        <h6 class="card-title mb-0">Archivo Adjunto</h6>
                                    </div>
                                    <div class="card-body">
                                        <input class="form-control" type="file" id="agregarArchivo" name="archivo" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx">
                                        <small class="text-muted">Formatos permitidos: JPG, PNG, PDF, Word, Excel</small>
                                        <div id="previewNuevoArchivo" class="mt-2 text-center"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Card de Descripción -->
                        <div class="card">
                            <div class="card-header bg-light text-center py-2">
                                <h6 class="card-title mb-0">Descripción</h6>
                            </div>
                            <div class="card-body">
                                <textarea class="form-control" rows="4" id="agregarDescripcion" name="descripcion" autocomplete="off" placeholder="Agrega una descripción detallada..." required></textarea>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer bg-light">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="bi bi-x-circle me-2"></i>Cancelar
                        </button>
                        <button type="submit" name="enviar" class="btn btnModal">
                            <i class="bi bi-send me-2"></i>Publicar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>


    <!-- Modal "Editar Comunicado" -->
    <div class="modal fade" id="editarModal" tabindex="-1" aria-labelledby="editarModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="editarModalLabel"><i class="bi bi-pencil-square me-2"></i>Editar Comunicado</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>

                <form class="formulario" method="post" action="" enctype="multipart/form-data">
                    <div class="modal-body">
                        <div class="row g-3">
                            <!-- Columna izquierda: Título y Cambiar Imagen -->
                            <div class="col-md-6 d-flex flex-column">
                                <!-- Card de Título -->
                                <div class="card mb-3 flex-grow-0">
                                    <div class="card-body">
                                        <div class="form-floating">
                                            <input class="form-control" type="text" id="editarTitulo" name="titulo" autocomplete="off" placeholder="Título del comunicado" required>
                                            <label for="editarTitulo">Título del comunicado</label>
                                        </div>
                                    </div>
                                </div>

                                <!-- Card de Nueva Imagen -->
                                <div class="card flex-grow-1">
                                    <div class="card-header bg-light text-center py-2">
                                        <h6 class="card-title mb-0">Cambiar Imagen</h6>
                                    </div>
                                    <div class="card-body d-flex flex-column">
                                        <input class="form-control mb-2" type="file" id="editarImagen" name="imagen">
                                        <small class="text-muted">Deja vacío para mantener la imagen actual</small>
                                    </div>
                                </div>
                            </div>

                            <!-- Columna derecha: Imagen Actual -->
                            <div class="col-md-6">
                                <div class="card h-100"> <!-- h-100 para que ocupe todo el alto disponible -->
                                    <div class="card-header bg-light text-center py-2">
                                        <h6 class="card-title mb-0">Imagen Actual</h6>
                                    </div>
                                    <div class="card-body d-flex flex-column align-items-center justify-content-center">
                                        <img id="imagenActual" src="" class="img-thumbnail mb-2" style="max-height: 200px; max-width: 100%; display: none;">
                                        <p id="sinImagen" class="text-muted">No hay imagen cargada</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Descripción (ancho completo) -->
                        <div class="card mt-3">
                            <div class="card-header bg-light text-center py-2">
                                <h6 class="card-title mb-0">Descripción</h6>
                            </div>
                            <div class="card-body">
                                <textarea class="form-control" rows="4" id="editarDescripcion" name="descripcion" autocomplete="off" placeholder="Agrega una descripción detallada..." required></textarea>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer bg-light">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="bi bi-x-circle me-2"></i>Cancelar
                        </button>
                        <button type="submit" name="actualizar" class="btn btnModal">
                            <i class="bi bi-save me-2"></i>Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>



    <!-- script-componente-sidebar -->
    <script src="../assets/js/components/sidebar.js"></script>

    <script src="../assets//js/pages/dashboard.js"></script>

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
</body>

</html>