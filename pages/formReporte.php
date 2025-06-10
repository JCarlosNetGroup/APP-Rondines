<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Ubicación</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../assets/css/pages/formReport.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
</head>

<body>
    <div class="container-fluid mobile-container">
        <header class="sticky-top">
            <div class="row text-white py-2 py-md-3 align-items-center headerModule">
                <div class="col-2">
                    <button id="back-btn" class="btn btn-sm text-white">
                        <i class="bi bi-caret-left-fill"></i>
                    </button>
                </div>
                <div class="col-8 text-center">
                    <h1 class="h5 mb-0" id="ubicacion-nombre-header">Reporte de Ubicación</h1>
                </div>
                <div class="col-2 text-end">
                    <!-- Espacio reservado para posible icono -->
                </div>
            </div>
        </header>

        <main class="py-2 py-md-3 px-2 px-md-3">
            <form id="reporte-form">
                <input type="hidden" id="id-ubicacion" name="id_ubicacion" value="">
                <input type="hidden" id="id-rondin" name="id_rondin" value="">

                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title text-center mb-3">Detalles de la Ubicación</h5>
                        <p class="card-text">
                            <strong>Nombre:</strong> <span id="ubicacion-nombre"></span><br>
                            <strong>Descripción:</strong> <span id="ubicacion-descripcion"></span>
                        </p>
                    </div>
                </div>

                <div class="mb-3">
                    <label for="observacion" class="form-label">Observaciones</label>
                    <textarea class="form-control" id="observacion" name="observacion" rows="4" placeholder="Escribe tus observaciones aquí"></textarea>
                </div>

                <!-- Reemplaza el input de foto principal -->
                <div class="mb-3">
                    <label for="foto" class="form-label">Fotografía</label>
                    <div class="text-center">
                        <button type="button" class="btn btn-outline-primary w-100 mb-2" id="start-camera-main">
                            <i class="bi bi-camera"></i> Activar Cámara
                        </button>
                        <video id="video-main" width="100%" autoplay style="display: none;"></video>
                        <button type="button" class="btn btn-outline-success w-100 mb-2" id="take-photo-btn-main" style="display: none;">
                            <i class="bi bi-camera-fill"></i> Tomar Foto
                        </button>
                        <canvas id="canvas-main" style="display: none;"></canvas>
                        <div id="photo-preview-container" class="mt-2">
                            <img id="photo-preview" src="#" alt="Previsualización de la foto" class="img-fluid rounded" style="display: none; max-height: 200px;">
                        </div>
                        <input type="hidden" id="foto" name="foto">
                    </div>
                </div>

                <!-- Cambia esta parte del botón de incidencia -->
                <div class="d-grid gap-2 mb-3">
                    <button type="button" class="btn btn-info" id="btn-incidencia" data-bs-toggle="modal" data-bs-target="#incidenciaModal" disabled>
                        <i class="bi bi-exclamation-triangle-fill"></i> <span>Reportar Incidencia</span>
                    </button>
                </div>

                <div class="d-grid gap-2">
                    <button type="submit" class="btn btn-success">
                        <i class="bi bi-check-circle-fill"></i> <span>Guardar Reporte</span>
                    </button>
                </div>

                <div class="d-grid gap-2 mt-3" id="finalizar-container" style="display: none;">
                    <button type="button" class="btn btn-primary" id="finalizar-btn" disabled>
                        <i class="bi bi-box-arrow-left"></i> <span>Finalizar y Regresar</span>
                    </button>
                </div>
            </form>
        </main>
    </div>

    <!-- Modal de Incidencia -->
    <div class="modal fade" id="incidenciaModal" tabindex="-1" aria-labelledby="incidenciaModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="incidenciaModalLabel">Reportar Incidencia</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="incidencia-form">
                        <input type="hidden" id="incidencia-id-ubicacion" name="id_ubicacion">
                        <input type="hidden" id="incidencia-id-rondin" name="id_rondin">
                        <input type="hidden" id="incidencia-reporte-id" name="reporte_id">

                        <div class="mb-3">
                            <label class="form-label">Nivel de Riesgo</label>
                            <div class="d-flex flex-wrap gap-3">
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="riesgo" id="riesgo-bajo" value="bajo" checked>
                                    <label class="form-check-label" for="riesgo-bajo">Bajo</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="riesgo" id="riesgo-medio" value="medio">
                                    <label class="form-check-label" for="riesgo-medio">Medio</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="riesgo" id="riesgo-alto" value="alto">
                                    <label class="form-check-label" for="riesgo-alto">Alto</label>
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="descripcion-incidencia" class="form-label">Descripción de la Incidencia</label>
                            <textarea class="form-control" id="descripcion-incidencia" name="descripcion_incidencia" rows="3" placeholder="Detalla la incidencia" required></textarea>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Foto de la Incidencia</label>
                            <div class="text-center">
                                <button type="button" class="btn btn-outline-primary w-100 mb-2" id="start-camera">
                                    <i class="bi bi-camera"></i> Activar Cámara
                                </button>
                                <video id="video" width="100%" autoplay style="display: none;"></video>
                                <button type="button" class="btn btn-outline-success w-100 mb-2" id="take-photo-btn-modal" style="display: none;">
                                    <i class="bi bi-camera-fill"></i> Tomar Foto
                                </button>
                                <canvas id="canvas" style="display: none;"></canvas>
                                <div id="incidencia-photo-preview-container" class="mt-2">
                                    <img id="incidencia-photo-preview" src="#" alt="Previsualización de la foto de incidencia" class="img-fluid rounded" style="display: none; max-height: 150px;">
                                </div>
                                <input type="hidden" id="foto-incidencia" name="foto_incidencia">
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary w-100">
                            <i class="bi bi-save"></i> Guardar Incidencia
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../assets/js/pages/formReporte.js"></script>
</body>

</html>