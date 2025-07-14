document.addEventListener('DOMContentLoaded', function () {
    // --- Constantes y Estado Inicial ---
    const API_ENDPOINTS = {
        GET_UBICACION: '../controller/geUbicacionForm.php',
        SAVE_REPORTE: '../controller/guardarReporte.php',
        SAVE_INCIDENCIA: '../controller/guardarIncidencia.php'
    };

    const SELECTORES = {
        BACK_BTN: '#back-btn',
        UBICACION_NOMBRE_HEADER: '#ubicacion-nombre-header',
        UBICACION_NOMBRE: '#ubicacion-nombre',
        UBICACION_DESCRIPCION: '#ubicacion-descripcion',
        ID_UBICACION_INPUT: '#id-ubicacion',
        ID_RONDIN_INPUT: '#id-rondin',
        OBSERVACION: '#observacion',
        REPORTE_FORM: '#reporte-form',
        FOTO_INPUT: '#foto',
        PHOTO_PREVIEW: '#photo-preview',
        START_CAMERA_MAIN: '#start-camera-main',
        START_CAMERA_FRONT: '#start-camera-front',
        VIDEO_MAIN: '#video-main',
        TAKE_PHOTO_BTN_MAIN: '#take-photo-btn-main',
        CANVAS_MAIN: '#canvas-main',
        INCIDENCIA_MODAL: '#incidenciaModal',
        INCIDENCIA_FORM: '#incidencia-form',
        INCIDENCIA_ID_UBICACION_INPUT: '#incidencia-id-ubicacion',
        INCIDENCIA_ID_RONDIN_INPUT: '#incidencia-id-rondin',
        INCIDENCIA_REPORTE_ID: '#incidencia-reporte-id',
        DESCRIPCION_INCIDENCIA: '#descripcion-incidencia',
        INCIDENCIA_PHOTO_PREVIEW: '#incidencia-photo-preview',
        FOTO_INCIDENCIA_INPUT: '#foto-incidencia',
        START_CAMERA_MODAL_BACK: '#start-camera-modal-back',
        START_CAMERA_MODAL_FRONT: '#start-camera-modal-front',
        VIDEO_MODAL: '#video-modal',
        TAKE_PHOTO_BTN_MODAL: '#take-photo-btn-modal',
        CANVAS_MODAL: '#canvas-modal',
        BTN_INCIDENCIA: '#btn-incidencia',
        FINALIZAR_BTN: '#finalizar-btn',
        FINALIZAR_CONTAINER: '#finalizar-container',
        GUARDAR_REPORTE_BTN: '#guardar-reporte-btn',
        INCIDENCIA_CONTAINER: '#incidencia-container'
    };

    const urlParams = new URLSearchParams(window.location.search);
    const ubicacionId = urlParams.get('id_ubicacion');
    const rondinId = urlParams.get('id_rondin');
    const fromScan = urlParams.get('from_scan') === 'true';

    let ubicacionData = null;
    let currentStream = null;
    let reporteGuardado = false;

    // --- Funciones de Utilidad (Helpers) ---
    const Utils = {
        getById: (id) => document.getElementById(id),
        querySelector: (selector) => document.querySelector(selector),
        show: (element) => element.style.display = 'block',
        hide: (element) => element.style.display = 'none',
        enable: (element) => element.disabled = false,
        disable: (element) => element.disabled = true,

        dataURLtoBlob: (dataURL) => {
            const arr = dataURL.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);

            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], { type: mime });
        },

        showAlert: async (message, type = 'error', title = null) => {
            const defaultTitles = {
                error: 'Error',
                success: 'Éxito',
                warning: 'Advertencia',
                info: 'Información'
            };

            const iconTypes = {
                error: 'error',
                success: 'success',
                warning: 'warning',
                info: 'info'
            };

            return Swal.fire({
                title: title || defaultTitles[type] || 'Mensaje',
                text: message,
                icon: iconTypes[type] || 'info',
                confirmButtonText: 'Aceptar',
                customClass: {
                    confirmButton: `btn btn-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'primary'}`
                },
                buttonsStyling: false
            });
        },

        showConfirmDialog: async (options) => {
            return Swal.fire({
                title: options.title || '¿Estás seguro?',
                text: options.text || '',
                icon: options.icon || 'question',
                showCancelButton: true,
                confirmButtonText: options.confirmText || 'Sí, continuar',
                cancelButtonText: options.cancelText || 'Cancelar',
                customClass: {
                    popup: 'custom-swal-popup',
                    actions: 'custom-swal-actions',
                    confirmButton: 'btn custom-confirm-button',
                    cancelButton: 'btn btn-secondary ms-1'
                },
                buttonsStyling: false,
                reverseButtons: true
            });
        },

        setLoadingState: (isLoading) => {
            const buttons = document.querySelectorAll('button');
            buttons.forEach(btn => btn.disabled = isLoading);
        }
    };

    // --- Cache de Elementos del DOM ---
    const Elements = {
        backBtn: Utils.getById('back-btn'),
        ubicacionNombreHeader: Utils.getById('ubicacion-nombre-header'),
        ubicacionNombre: Utils.getById('ubicacion-nombre'),
        ubicacionDescripcion: Utils.getById('ubicacion-descripcion'),
        idUbicacionInput: Utils.getById('id-ubicacion'),
        idRondinInput: Utils.getById('id-rondin'),
        observacion: Utils.getById('observacion'),
        reporteForm: Utils.getById('reporte-form'),
        fotoInput: Utils.getById('foto'),
        photoPreview: Utils.getById('photo-preview'),
        startCameraMain: Utils.getById('start-camera-main'),
        startCameraFront: Utils.getById('start-camera-front'),
        videoMain: Utils.getById('video-main'),
        takePhotoBtnMain: Utils.getById('take-photo-btn-main'),
        canvasMain: Utils.getById('canvas-main'),
        incidenciaModal: new bootstrap.Modal(Utils.getById('incidenciaModal')),
        incidenciaForm: Utils.getById('incidencia-form'),
        incidenciaIdUbicacionInput: Utils.getById('incidencia-id-ubicacion'),
        incidenciaIdRondinInput: Utils.getById('incidencia-id-rondin'),
        incidenciaReporteId: Utils.getById('incidencia-reporte-id'),
        descripcionIncidencia: Utils.getById('descripcion-incidencia'),
        incidenciaPhotoPreview: Utils.getById('incidencia-photo-preview'),
        fotoIncidenciaInput: Utils.getById('foto-incidencia'),
        startCameraModalBack: Utils.getById('start-camera-modal-back'),
        startCameraModalFront: Utils.getById('start-camera-modal-front'),
        videoModal: Utils.getById('video-modal'),
        takePhotoBtnModal: Utils.getById('take-photo-btn-modal'),
        canvasModal: Utils.getById('canvas-modal'),
        btnIncidencia: Utils.getById('btn-incidencia'),
        finalizarBtn: Utils.getById('finalizar-btn'),
        finalizarContainer: Utils.getById('finalizar-container'),
        guardarReporteBtn: Utils.getById('guardar-reporte-btn'),
        incidenciaContainer: Utils.getById('incidencia-container')
    };

    // --- Módulo de Compatibilidad ---
    const Compatibility = {
        checkCameraSupport: () => {
            return new Promise((resolve) => {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    Utils.showAlert("Tu navegador no soporta el acceso a la cámara o esta función no está disponible.");
                    return resolve(false);
                }

                if (navigator.permissions) {
                    navigator.permissions.query({ name: 'camera' })
                        .then(permissionStatus => {
                            if (permissionStatus.state === 'denied') {
                                Utils.showAlert("El acceso a la cámara ha sido denegado. Por favor, actualiza los permisos en la configuración de tu navegador.");
                                return resolve(false);
                            }
                            resolve(true);
                        })
                        .catch(() => resolve(true));
                } else {
                    resolve(true);
                }
            });
        }
    };

    // --- Módulo de la Cámara ---
    const CameraModule = {
        initCamera: async (videoElement, useFrontCamera = false) => {
            CameraModule.stopCamera();
            const constraints = {
                video: {
                    facingMode: useFrontCamera ? 'user' : 'environment',
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 }
                },
                audio: false
            };

            try {
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                currentStream = stream;
                videoElement.srcObject = stream;
                return new Promise((resolve) => {
                    videoElement.onloadedmetadata = () => resolve();
                });
            } catch (error) {
                console.warn("Intento inicial fallido, probando constraints más básicas:", error);

                try {
                    const basicConstraints = {
                        video: {
                            facingMode: useFrontCamera ? 'user' : 'environment'
                        },
                        audio: false
                    };

                    const stream = await navigator.mediaDevices.getUserMedia(basicConstraints);
                    currentStream = stream;
                    videoElement.srcObject = stream;
                    return new Promise((resolve) => {
                        videoElement.onloadedmetadata = () => resolve();
                    });
                } catch (finalError) {
                    CameraModule.handleCameraError(finalError);
                    throw finalError;
                }
            }
        },

        takePhoto: (videoElement, canvasElement, previewElement, inputElement) => {
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
            const context = canvasElement.getContext('2d');
            context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

            const imageDataUrl = canvasElement.toDataURL('image/jpeg', 0.7);
            previewElement.src = imageDataUrl;
            Utils.show(previewElement);
            inputElement.value = imageDataUrl;
        },

        stopCamera: () => {
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
                currentStream = null;
            }
        },

        handleCameraError: (error) => {
            console.error("Error al acceder a la cámara:", error);
            let errorMessage = "No se pudo acceder a la cámara.";

            if (error.name === 'NotAllowedError') {
                errorMessage = "Permiso denegado. Por favor, permite el acceso a la cámara en la configuración de tu navegador.";
            } else if (error.name === 'NotFoundError') {
                errorMessage = "No se encontró ningún dispositivo de cámara disponible.";
            } else if (error.name === 'NotReadableError') {
                errorMessage = "La cámara no se puede leer. Puede estar en uso por otra aplicación.";
            } else if (error.name === 'OverconstrainedError') {
                errorMessage = "La configuración solicitada no es compatible con tu dispositivo.";
            }

            Utils.showAlert(errorMessage);
        }
    };

    // --- Módulo de Actualización de UI ---
    const UIManager = {
        updateUbicacionUI: () => {
            Elements.ubicacionNombre.textContent = ubicacionData.nombre || 'N/A';
            Elements.ubicacionDescripcion.textContent = ubicacionData.descripcion || 'Sin descripción';
            if (ubicacionData.nombre) {
                Elements.ubicacionNombreHeader.textContent = ubicacionData.nombre;
            }
        },

        resetIncidenciaForm: () => {
            Elements.incidenciaForm.reset();
            Utils.hide(Elements.incidenciaPhotoPreview);
            Elements.incidenciaPhotoPreview.src = '#';
            Elements.fotoIncidenciaInput.value = '';
        },

        updateUIAfterReporteSaved: () => {
            Elements.guardarReporteBtn.classList.add('completado');
            Elements.btnIncidencia.classList.add('visible');
            Elements.finalizarContainer.classList.add('visible');
            Utils.enable(Elements.btnIncidencia);
            Utils.enable(Elements.finalizarBtn);
        },

        updateReporteSubmitButton: (isSaved) => {
            if (isSaved) {
                Elements.guardarReporteBtn.innerHTML = '<i class="bi bi-check-circle-fill"></i> <span>Reporte Guardado</span>';
                Elements.guardarReporteBtn.classList.remove('btn-success');
                Elements.guardarReporteBtn.classList.add('btn-secondary');
            }
        }
    };

    // --- Módulo de Servicio de Datos ---
    const DataService = {
        loadUbicacionData: async (idUbicacion) => {
            try {
                const response = await fetch(`${API_ENDPOINTS.GET_UBICACION}?id_ubicacion=${idUbicacion}&id_rondin=${rondinId}`);

                if (!response.ok) {
                    throw new Error('No se pudo cargar la información de la ubicación.');
                }

                const data = await response.json();

                if (data.success && data.ubicacion) {
                    ubicacionData = data.ubicacion;
                    UIManager.updateUbicacionUI();
                } else {
                    await Utils.showAlert('No se encontraron datos para esta ubicación.', 'error');
                    window.history.back();
                }
            } catch (error) {
                console.error('Error cargando datos de ubicación:', error);
                await Utils.showAlert('Error al cargar la información de la ubicación: ' + error.message, 'error');
                window.history.back();
            }
        },

        sendReporte: async () => {
            if (!Elements.fotoInput.value) {
                await Utils.showAlert('Debes tomar una fotografía antes de guardar el reporte', 'error');
                return;
            }
            if (!Elements.observacion.value.trim()) {
                await Utils.showAlert('Debes ingresar una descripción antes de guardar el reporte', 'error');
                return;
            }

            const formData = new FormData(Elements.reporteForm);
            try {
                const blob = Utils.dataURLtoBlob(Elements.fotoInput.value);
                formData.append('foto', blob, 'foto_reporte.jpg');
            } catch (error) {
                await Utils.showAlert('Error al procesar la fotografía: ' + error.message, 'error');
                return;
            }

            try {
                Utils.setLoadingState(true);
                const response = await fetch(API_ENDPOINTS.SAVE_REPORTE, {
                    method: 'POST',
                    body: formData,
                    credentials: 'include'
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
                }

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.message || 'Error en el servidor');
                }

                Elements.reporteForm.dataset.reporteId = data.reporte_id;
                reporteGuardado = true;

                UIManager.updateUIAfterReporteSaved();
                UIManager.updateReporteSubmitButton(true);

                await Utils.showAlert('¡Reporte guardado exitosamente! Ahora puedes agregar incidencias si es necesario o finalizar.', 'success');

                // Redirigir con parámetro saved=true solo si venimos del escaneo
                // if (fromScan) {
                //     window.location.href = `ubicacionesRuta.php?id_rondin=${rondinId}&saved=true&id_ubicacion=${ubicacionId}`;
                // }

            } catch (error) {
                console.error('Error al guardar reporte:', error);
                await Utils.showAlert('Error al guardar: ' + error.message, 'error');
            } finally {
                Utils.setLoadingState(false);
            }
        },

        sendIncidencia: async () => {
            if (!reporteGuardado || !Elements.reporteForm.dataset.reporteId) {
                await Utils.showAlert('Primero debes guardar el reporte antes de agregar una incidencia', 'error');
                return;
            }
            if (!Elements.descripcionIncidencia.value.trim()) {
                await Utils.showAlert('Debes ingresar una descripción para la incidencia', 'error');
                return;
            }

            const formData = new FormData();
            formData.append('reporte_id', Elements.reporteForm.dataset.reporteId);
            formData.append('ubicacion_id', Elements.idUbicacionInput.value);
            formData.append('descripcion_incidencia', Elements.descripcionIncidencia.value);
            formData.append('riesgo', Utils.querySelector('input[name="riesgo"]:checked').value);

            if (Elements.fotoIncidenciaInput.value) {
                try {
                    const blob = Utils.dataURLtoBlob(Elements.fotoIncidenciaInput.value);
                    formData.append('foto_incidencia', blob, 'foto_incidencia.jpg');
                } catch (error) {
                    console.error('Error al procesar foto de incidencia:', error);
                    await Utils.showAlert('Error al procesar foto de incidencia: ' + error.message, 'error');
                    return;
                }
            }

            try {
                Utils.setLoadingState(true);
                const response = await fetch(API_ENDPOINTS.SAVE_INCIDENCIA, {
                    method: 'POST',
                    body: formData,
                    credentials: 'include'
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
                }

                const data = await response.json();

                if (data.success) {
                    await Utils.showAlert('¡Incidencia reportada exitosamente!', 'success');
                    UIManager.resetIncidenciaForm();
                    Elements.incidenciaModal.hide();

                    // Actualizar UI como completado
                    UIManager.updateUIAfterReporteSaved();
                    UIManager.updateReporteSubmitButton(true);

                    setTimeout(() => {
                        window.location.href = `ubicacionesRuta.php?id_rondin=${rondinId}&saved=true&id_ubicacion=${ubicacionId}`;
                    }, 1000);
                } else {
                    throw new Error(data.message || 'Error desconocido al guardar incidencia');
                }
            } catch (error) {
                console.error('Error enviando incidencia:', error);
                await Utils.showAlert('Error al reportar incidencia: ' + error.message, 'error');
            } finally {
                Utils.setLoadingState(false);
            }
        }
    };

    // --- Módulo de Validación ---
    const ValidationModule = {
        validateFullReport: async () => {
            if (!reporteGuardado) {
                await Utils.showAlert('Primero debes guardar el reporte correctamente antes de finalizar', 'error');
                return false;
            }
            if (!Elements.observacion.value.trim()) {
                await Utils.showAlert('Debes completar la descripción del reporte antes de finalizar', 'error');
                return false;
            }
            if (!Elements.fotoInput.value) {
                await Utils.showAlert('Debes tomar una fotografía del reporte antes de finalizar', 'error');
                return false;
            }
            return true;
        },

        validateReportFields: () => {
            const descripcionValida = Elements.observacion.value.trim().length > 0;
            const fotoValida = Elements.fotoInput.value !== '';

            if (reporteGuardado && descripcionValida && fotoValida) {
                Utils.enable(Elements.finalizarBtn);
            } else {
                Utils.disable(Elements.finalizarBtn);
            }
        }
    };

    // --- Módulo de Manejadores de Eventos ---
    const EventHandlers = {
        setupListeners: () => {
            // Botón de regresar
            Elements.backBtn.addEventListener('click', async (e) => {
                if (reporteGuardado) {
                    window.history.back();
                } else {
                    const result = await Utils.showConfirmDialog({
                        title: 'Salir sin guardar',
                        text: '¿Estás seguro de que deseas salir sin guardar el reporte? Los cambios no se guardarán.',
                        confirmText: 'Sí, salir',
                        cancelText: 'Cancelar'
                    });

                    if (result.isConfirmed) {
                        window.history.back();
                    }
                }
            });

            // Configuración de la Cámara Principal - Trasera
            Elements.startCameraMain.addEventListener('click', async () => {
                const hasSupport = await Compatibility.checkCameraSupport();
                if (!hasSupport) return;

                try {
                    await CameraModule.initCamera(Elements.videoMain, false);
                    Utils.show(Elements.videoMain);
                    Utils.hide(Elements.startCameraMain);
                    Utils.hide(Elements.startCameraFront);
                    Utils.show(Elements.takePhotoBtnMain);
                } catch (error) {
                    // Manejado dentro de CameraModule.initCamera
                }
            });

            // Configuración de la Cámara Principal - Frontal
            Elements.startCameraFront.addEventListener('click', async () => {
                const hasSupport = await Compatibility.checkCameraSupport();
                if (!hasSupport) return;

                try {
                    await CameraModule.initCamera(Elements.videoMain, true);
                    Utils.show(Elements.videoMain);
                    Utils.hide(Elements.startCameraMain);
                    Utils.hide(Elements.startCameraFront);
                    Utils.show(Elements.takePhotoBtnMain);
                } catch (error) {
                    // Manejado dentro de CameraModule.initCamera
                }
            });

            Elements.takePhotoBtnMain.addEventListener('click', () => {
                CameraModule.takePhoto(Elements.videoMain, Elements.canvasMain, Elements.photoPreview, Elements.fotoInput);
                CameraModule.stopCamera();
                Utils.hide(Elements.videoMain);
                Utils.hide(Elements.takePhotoBtnMain);
                Utils.show(Elements.startCameraMain);
                Utils.show(Elements.startCameraFront);
                ValidationModule.validateReportFields();
            });

            // Configuración de la Cámara de Incidencia - Trasera
            Elements.startCameraModalBack.addEventListener('click', async () => {
                const hasSupport = await Compatibility.checkCameraSupport();
                if (!hasSupport) return;

                try {
                    await CameraModule.initCamera(Elements.videoModal, false);
                    Utils.show(Elements.videoModal);
                    Utils.hide(Elements.startCameraModalBack);
                    Utils.hide(Elements.startCameraModalFront);
                    Utils.show(Elements.takePhotoBtnModal);
                } catch (error) {
                    // Manejado dentro de CameraModule.initCamera
                }
            });

            // Configuración de la Cámara de Incidencia - Frontal
            Elements.startCameraModalFront.addEventListener('click', async () => {
                const hasSupport = await Compatibility.checkCameraSupport();
                if (!hasSupport) return;

                try {
                    await CameraModule.initCamera(Elements.videoModal, true);
                    Utils.show(Elements.videoModal);
                    Utils.hide(Elements.startCameraModalBack);
                    Utils.hide(Elements.startCameraModalFront);
                    Utils.show(Elements.takePhotoBtnModal);
                } catch (error) {
                    // Manejado dentro de CameraModule.initCamera
                }
            });

            Elements.takePhotoBtnModal.addEventListener('click', () => {
                CameraModule.takePhoto(Elements.videoModal, Elements.canvasModal, Elements.incidenciaPhotoPreview, Elements.fotoIncidenciaInput);
                CameraModule.stopCamera();
                Utils.hide(Elements.videoModal);
                Utils.hide(Elements.takePhotoBtnModal);
                Utils.show(Elements.startCameraModalBack);
                Utils.show(Elements.startCameraModalFront);
            });

            // Eventos del modal de incidencia
            Elements.incidenciaModal._element.addEventListener('hidden.bs.modal', () => {
                CameraModule.stopCamera();
                EventHandlers.resetIncidenciaCameraUI();
            });

            Elements.incidenciaModal._element.addEventListener('show.bs.modal', function () {
                if (reporteGuardado && Elements.reporteForm.dataset.reporteId) {
                    Elements.incidenciaReporteId.value = Elements.reporteForm.dataset.reporteId;
                }
            });

            // Formulario de reporte
            Elements.reporteForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                await DataService.sendReporte();
            });

            // Formulario de incidencia
            Elements.incidenciaForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                await DataService.sendIncidencia();
            });

            // Botón de finalizar
            Elements.finalizarBtn.addEventListener('click', async () => {
                if (!await ValidationModule.validateFullReport()) {
                    return;
                }

                const result = await Utils.showConfirmDialog({
                    title: 'Finalizar reporte',
                    text: '¿Estás seguro de que deseas finalizar y regresar a la lista de ubicaciones?',
                    confirmText: 'Si, Finalizar'
                });

                if (result.isConfirmed) {
                    // Redirigir con parámetro saved=true solo si venimos del escaneo
                    if (fromScan) {
                        window.location.href = `ubicacionesRuta.php?id_rondin=${rondinId}&saved=true&id_ubicacion=${ubicacionId}`;
                    } else {
                        window.location.href = `ubicacionesRuta.php?id_rondin=${rondinId}`;
                    }
                }
            });

            // Validación en tiempo real
            Elements.observacion.addEventListener('input', ValidationModule.validateReportFields);
            Elements.fotoInput.addEventListener('change', ValidationModule.validateReportFields);
        },

        resetIncidenciaCameraUI: () => {
            Utils.hide(Elements.videoModal);
            Utils.hide(Elements.takePhotoBtnModal);
            Utils.show(Elements.startCameraModalBack);
            Utils.show(Elements.startCameraModalFront);
        }
    };

    // --- Función de Inicialización ---
    function init() {
        EventHandlers.setupListeners();

        Utils.hide(Elements.btnIncidencia);
        Utils.hide(Elements.finalizarContainer);
        Utils.disable(Elements.btnIncidencia);
        Utils.disable(Elements.finalizarBtn);

        if (ubicacionId && rondinId) {
            Elements.idUbicacionInput.value = ubicacionId;
            Elements.idRondinInput.value = rondinId;
            Elements.incidenciaIdUbicacionInput.value = ubicacionId;
            Elements.incidenciaIdRondinInput.value = rondinId;
            DataService.loadUbicacionData(ubicacionId);
        } else {
            Utils.showAlert('Error: ID de ubicación o rondín no especificado.', 'error');
            window.history.back();
        }
    }

    // Inicializar la aplicación
    init();
});