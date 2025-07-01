<?php
include_once '../controller/ValidarSesion.php'
?>

<!doctype html>
<html lang="es">

<head>
    <title>Reportes</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
    <link rel="stylesheet" href="../assets/css/components/sidebar.css">
    <link rel="stylesheet" href="../assets/css/pages/reportes.css">
</head>

<body>
    <div class="content-main d-flex">
        <?php include_once '../components/sidebar.php' ?>

        <main class="flex-grow-1">
            <header>
                <div class="info-section d-flex">
                    <i class="bi bi-journals"></i>
                    <h2>Reportes</h2>
                </div>
                <div class="description-section py-4">
                    <p class="fw-semibold">Modulo de Reportes: Gestiona y valida los reportes de los rondines realizados por tu equipo de seguridad.</p>
                </div>
            </header>

            <button id="btnExportarExcel" class="btn btn-export-excel">
                <i class="bi bi-file-earmark-excel me-2"></i>
                <span>Excel</span>
            </button>

            <div class="d-flex justify-content-between align-items-center pt-2 gap-3 flex-wrap">
                <div class="d-flex align-items-center gap-2">
                    <label for="itemsPerPageSelect" class="mb-0">Mostrar:</label>
                    <select id="itemsPerPageSelect" class="form-select form-select-sm">
                        <option value="10" selected>10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                        <option value="200">200</option>
                        <option value="500">500</option>
                    </select>
                </div>

                <div class="d-flex align-items-center gap-3 flex-wrap">
                    <div class="d-flex align-items-center gap-2">
                        <label for="fechaInicio" class="mb-0">Desde:</label>
                        <input type="date" id="fechaInicio" class="form-control form-control-sm">
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <label for="fechaFin" class="mb-0">Hasta:</label>
                        <input type="date" id="fechaFin" class="form-control form-control-sm">
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <button id="btnFiltrar" class="btn btn-sm"><i class="bi bi-search"></i></button>
                        <button id="btnLimpiar" class="btn btn-sm d-none"><i class="bi bi-calendar-x"></i></button>
                    </div>
                </div>

                <div class="d-flex align-items-center gap-2">
                    <label for="inputBusqueda" class="mb-0">Buscar:</label>
                    <input type="search" id="inputBusqueda" class="form-control form-control-sm">
                </div>
            </div>

            <div class="row py-2">
                <div class="col">
                    <div class="table-responsive">
                        <table class="table table-sm table-striped table-hover" id="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Rondin</th>
                                    <th>Guardia</th>
                                    <th>Ubicacion</th>
                                    <th>Orden</th>
                                    <th>Observación</th>
                                    <th>Fecha</th>
                                    <th>Incidencia</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col">
                    <nav aria-label="Page navigation">
                        <ul class="pagination justify-content-center" id="pagination">
                        </ul>
                    </nav>
                </div>
            </div>

            <!-- Modal de Detalles del Reporte -->
            <div class="modal fade" id="viewReport" tabindex="-1" aria-labelledby="viewReportLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header text-center">
                            <h5 class="modal-title w-100" id="viewReportLabel">
                                <i class="bi bi-file-earmark-text me-2"></i>Detalles del Reporte
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <!-- Primera fila: Información básica y Observaciones -->
                            <div class="row g-3 mb-3">
                                <!-- Card de Información Básica -->
                                <div class="col-md-6">
                                    <div class="card h-100">
                                        <div class="card-header bg-light text-center py-2">
                                            <h6 class="card-title mb-0">Información Básica</h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="row g-2">
                                                <div class="col-12">
                                                    <p class="mb-2"><strong><i class="bi bi-hash me-2"></i>Reporte:</strong> <span id="detail-id" class="float-end"></span></p>
                                                </div>
                                                <div class="col-12">
                                                    <p class="mb-2"><strong><i class="bi bi-person me-2"></i>Realizado por:</strong> <span id="detail-guardia" class="float-end"></span></p>
                                                </div>
                                                <div class="col-12">
                                                    <p class="mb-2"><strong><i class="bi bi-calendar me-2"></i>Fecha:</strong> <span id="detail-fecha" class="float-end"></span></p>
                                                </div>
                                                <div class="col-12">
                                                    <p class="mb-0"><strong><i class="bi bi-exclamation-triangle me-2"></i>Incidencias:</strong>
                                                        <span id="detail-incidencia" class="badge float-end"></span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Card de Observaciones -->
                                <div class="col-md-6">
                                    <div class="card h-100">
                                        <div class="card-header bg-light text-center py-2">
                                            <h6 class="card-title mb-0">Observaciones</h6>
                                        </div>
                                        <div class="card-body">
                                            <div id="detail-observacion" class="text-muted" style="min-height: 100px;"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Segunda fila: Fotos del Reporte -->
                            <div class="row mb-3">
                                <div class="col-12">
                                    <div class="card">
                                        <div class="card-header bg-light text-center py-2">
                                            <h6 class="card-title mb-0">Fotos del Reporte</h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="row g-2" id="report-images-container">
                                                <!-- Las imágenes se insertarán dinámicamente aquí -->
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Tercera fila: Detalles de Incidencias -->
                            <div class="row">
                                <div class="col-12">
                                    <div class="card d-none" id="incidencias-section">
                                        <div class="card-header bg-light text-center py-2">
                                            <h6 class="card-title mb-0">Detalles de Incidencias</h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="accordion" id="incidencias-accordion">
                                                <!-- El contenido del acordeón se generará dinámicamente -->
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer bg-light">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="bi bi-x-circle me-2"></i>Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script src="../assets/js/components/sidebar.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    <script src="../assets/js/pages/reportes.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.16.9/xlsx.full.min.js"></script>

    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"
        integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r"
        crossorigin="anonymous"></script>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.min.js"
        integrity="sha384-BBtl+eGJRgqQAUMxJ7pMwbEyER4l1g+O15P+16Ep7Q9Q+zqX6gSbd85u4mG4QzX+"
        crossorigin="anonymous"></script>
</body>

</html>