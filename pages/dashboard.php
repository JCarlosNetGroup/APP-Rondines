<?php
include_once '../controller/ValidarSesion.php';
?>

<!doctype html>
<html lang="es">

<head>
    <title>Comunicados</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">

    <link rel="stylesheet" href="../assets/css/components/sidebar.css">
    <link rel="stylesheet" href="../assets/css/pages/dashboard.css">
</head>

<body>

    <div class="content-main d-flex">

        <?php include_once '../components/sidebar.php' ?>

        <main class="flex-grow-1">
            <div>
                <header class="mb-5">
                    <div class="info-section">
                        <i class="bi bi-grid-1x2-fill"></i>
                        <h2 class="pb-1">Comunicados</h2>
                    </div>
                    <div class="description-section">
                        <p class="fw-semibold">Módulo de Comunicados: Gestiona y comparte información con tu equipo de seguridad.</p>
                    </div>
                </header>

                <div class="d-flex justify-content-end mb-4">

                </div>

                <section class="row g-4 mb-5">
                    <article class="col-12 col-lg-8">
                        <div class="comunicado card shadow-sm" id="main-comunicado-container">
                            <div class="card-body text-center py-5">
                                <i class="bi bi-info-circle fs-1 text-muted mb-3"></i>
                                <p class="mt-3 fs-5 text-secondary">Cargando comunicado principal...</p>
                            </div>
                        </div>
                    </article>
                </section>

                <hr class="my-5">
                <section id="comunicados-section">
                    <h4 class="h5 h4-md mb-3 pb-2 border-bottom">Historial de Comunicados</h4>
                    <div class="d-flex justify-content-end px-1 py-2">
                        <button class="btn iconModal p-0" data-bs-toggle="modal" data-bs-target="#miModal" title="Crear nuevo comunicado">
                            <i class="bi bi-plus-square-fill"></i>
                        </button>
                    </div>
                    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">

                        <div class="d-flex flex-column flex-md-row gap-3 w-100">
                            <div class="form-group d-flex flex-column flex-grow-1">
                                <label for="search-comunicado-input" class="form-label text-muted px-1 m-0">Titulo</label>
                                <input type="search" class="form-control form-control-sm" placeholder="Buscar comunicado..." id="search-comunicado-input">
                            </div>

                            <div class="form-group d-flex flex-column flex-grow-1">
                                <label for="filter-date-from" class="form-label text-muted px-1 m-0">Desde</label>
                                <input type="date" class="form-control form-control-sm" id="filter-date-from" title="Fecha desde">
                            </div>

                            <div class="form-group d-flex flex-column flex-grow-1">
                                <label for="filter-date-to" class="form-label text-muted px-1 m-0">Hasta</label>
                                <input type="date" class="form-control form-control-sm" id="filter-date-to" title="Fecha hasta">
                            </div>

                            <div class="form-group d-flex flex-column flex-grow-1">
                                <label for="filter-comunicado-select" class="form-label text-muted px-1 m-0">Vigencia</label>
                                <select class="form-select form-select-sm" id="filter-comunicado-select">
                                    <option value="">Todos</option>
                                    <option value="vigente" selected>Vigentes</option>
                                    <option value="expirado">Expirados</option>
                                </select>
                            </div>

                            <div class="form-group d-flex flex-column flex-grow-1">
                                <label for="filter-comunicado-prioridad" class="form-label text-muted px-1 m-0">Prioridad</label>
                                <select class="form-select form-select-sm" id="filter-comunicado-prioridad">
                                    <option value="">Todos</option>
                                    <option value="medio">Medio</option>
                                    <option value="importante">Importante</option>
                                </select>
                            </div>
                        </div>

                        <nav class="mt-3 mt-md-4">
                            <ul class="pagination pagination-sm justify-content-center mb-0" id="pagination-container">
                            </ul>
                        </nav>
                    </div>

                    <div class="row g-4" id="comunicados-container">
                        <!-- Aqui se cargan los comunicados  -->
                    </div>
                </section>
            </div>
        </main>
    </div>

    <div class="modal fade" id="miModal" tabindex="-1" aria-labelledby="miModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="miModalLabel"><i class="bi bi-megaphone me-2"></i>Nuevo Comunicado</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>

                <form class="formulario" method="post" action="" id="formComunicado">
                    <div class="modal-body">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <div class="card mb-3 shadow-sm">
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

                                <div class="card mb-3 shadow-sm">
                                    <div class="card-header bg-light text-center py-2">
                                        <h6 class="card-title mb-0">Prioridad</h6>
                                    </div>
                                    <div class="card-body">
                                        <select class="form-select" id="agregarPrioridad" name="prioridad" required>
                                            <option value="medio" selected>Medio</option>
                                            <option value="importante">Importante</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="card mb-3 shadow-sm">
                                    <div class="card-header bg-light text-center py-2">
                                        <h6 class="card-title mb-0">Vigencia</h6>
                                    </div>
                                    <div class="card-body">
                                        <label for="fechaExpiracion" class="form-label small text-muted mb-2">Fecha de Expiración</label>
                                        <input type="date" class="form-control" id="fechaExpiracion" name="fecha_expiracion" required>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="card mt-3 shadow-sm">
                            <div class="card-header bg-light text-center py-2">
                                <h6 class="card-title mb-0">Contenido</h6>
                            </div>
                            <div class="card-body">
                                <textarea class="form-control" rows="4" id="agregarDescripcion" name="contenido" autocomplete="off" placeholder="Agrega el contenido del comunicado..." required></textarea>
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

    <div class="modal fade" id="editarModal" tabindex="-1" aria-labelledby="editarModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="editarModalLabel"><i class="bi bi-pencil-square me-2"></i>Editar Comunicado</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>

                <form class="formulario" method="post" action="" enctype="multipart/form-data" id="formEditarComunicado">
                    <input type="hidden" id="editComunicadoId" name="id_comunicado">
                    <div class="modal-body">
                        <div class="row g-3">
                            <div class="col-md-6 d-flex flex-column">
                                <div class="card mb-3 shadow-sm flex-grow-0">
                                    <div class="card-header bg-light text-center py-2">
                                        <h6 class="card-title mb-0">Título</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="form-floating">
                                            <input class="form-control" type="text" id="editarTitulo" name="titulo" autocomplete="off" placeholder="Título del comunicado" required>
                                            <label for="editarTitulo">Título del comunicado</label>
                                        </div>
                                    </div>
                                </div>

                                <div class="card mb-3 shadow-sm flex-grow-0">
                                    <div class="card-header bg-light text-center py-2">
                                        <h6 class="card-title mb-0">Prioridad</h6>
                                    </div>
                                    <div class="card-body">
                                        <select class="form-select" id="editarPrioridad" name="prioridad" required>
                                            <option value="medio">Medio</option>
                                            <option value="importante">Importante</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-6 d-flex flex-column">
                                <div class="card mb-3 shadow-sm flex-grow-0">
                                    <div class="card-header bg-light text-center py-2">
                                        <h6 class="card-title mb-0">Vigencia</h6>
                                    </div>
                                    <div class="card-body">
                                        <label for="editarFechaExpiracion" class="form-label small text-muted mb-2">Fecha de Expiración</label>
                                        <input type="date" class="form-control" id="editarFechaExpiracion" name="fecha_expiracion" required>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="card mt-3 shadow-sm">
                            <div class="card-header bg-light text-center py-2">
                                <h6 class="card-title mb-0">Contenido</h6>
                            </div>
                            <div class="card-body">
                                <textarea class="form-control" rows="4" id="editarContenido" name="contenido" autocomplete="off" placeholder="Agrega el contenido del comunicado..." required></textarea>
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

    <div class="modal fade" id="verComunicadoModal" tabindex="-1" aria-labelledby="verComunicadoModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="verComunicadoModalLabel"><i class="bi bi-file-text-fill px-1"></i>Detalles del Comunicado</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body">
                    <h4 id="viewComunicadoTitulo" class="mb-2 fw-semibold"></h4>
                    <p class="text-muted small mb-2">
                        Publicado: <span id="viewComunicadoFechaPublicacion" class="fw-semibold"></span> |
                        Expira: <span id="viewComunicadoFechaExpiracion" class="fw-semibold"></span> |
                        Prioridad: <span id="viewComunicadoPrioridad"></span> |
                        Estado: <span id="viewComunicadoEstado"></span>
                    </p>
                    <div class="lead text-dark py-2" id="viewComunicadoContenido"></div>
                    <p class="text-muted small pt-2 my-0">
                        Autor: <span id="viewComunicadoAutor" class="fw-semibold"></span>
                    </p>
                    <hr class="my-1">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    <button type="button" class="btn btn-primary" id="btnEditarDesdeVerModal">Editar</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        window.currentUserId = <?php echo json_encode($_SESSION['empleado_id'] ?? null); ?>;
    </script>
    <script src="../assets/js/components/sidebar.js"></script>
    <script src="../assets/js/pages/dashboard.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"
        integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r"
        crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.min.js"
        integrity="sha384-BBtl+eGJRgqQAUMxJ7pMwbEyER4l1g+O15P+16Ep7Q9Q+zqX6gSbd85u4mG4QzX+"
        crossorigin="anonymous"></script>
</body>

</html>