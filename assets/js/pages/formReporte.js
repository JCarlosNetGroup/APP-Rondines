document.addEventListener('DOMContentLoaded', function() {
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
        START_CAMERA_MODAL: '#start-camera',
        VIDEO_MODAL: '#video',
        TAKE_PHOTO_BTN_MODAL: '#take-photo-btn-modal',
        CANVAS_MODAL: '#canvas',
        BTN_INCIDENCIA: '[data-bs-target="#incidenciaModal"]',
        FINALIZAR_BTN: '#finalizar-btn',
        FINALIZAR_CONTAINER: '#finalizar-container',
        LOADING_SPINNER: '#loadingSpinner'
    };

    const urlParams = new URLSearchParams(window.location.search);
    const ubicacionId = urlParams.get('id_ubicacion');
    const rondinId = urlParams.get('id_rondin');

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

        showAlert: (message, type = 'error') => {
            if (type === 'error') {
                console.error('Error:', message);
                alert('Error: ' + message);
            } else {
                console.log('Éxito:', message);
                alert('Éxito: ' + message);
            }
        },

        setLoadingState: (isLoading) => {
            const buttons = document.querySelectorAll('button');
            buttons.forEach(btn => Utils.setElementDisabled(btn, isLoading));
            const spinner = Utils.getById('loadingSpinner');
            if (spinner) {
                Utils.displayElement(spinner, isLoading);
            }
        },

        setElementDisabled: (element, disabled) => {
            element.disabled = disabled;
        },

        displayElement: (element, show) => {
            element.style.display = show ? 'block' : 'none';
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
        startCameraModal: Utils.getById('start-camera'),
        videoModal: Utils.getById('video'),
        takePhotoBtnModal: Utils.getById('take-photo-btn-modal'),
        canvasModal: Utils.getById('canvas'),
        btnIncidencia: Utils.querySelector('[data-bs-target="#incidenciaModal"]'),
        finalizarBtn: Utils.getById('finalizar-btn'),
        finalizarContainer: Utils.getById('finalizar-container')
    };

    // --- Módulo de la Cámara ---
    const CameraModule = {
        initCamera: async (videoElement) => {
            CameraModule.stopCamera();
            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: {
                        ideal: 1280
                    },
                    height: {
                        ideal: 720
                    }
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
                CameraModule.handleCameraError(error);
                throw error; // Re-lanza para propagar el error
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
            Utils.showAlert("No se pudo acceder a la cámara. Asegúrate de conceder los permisos necesarios.");
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

        updateReporteSubmitButton: (isSaved) => {
            const submitBtn = Elements.reporteForm.querySelector('[type="submit"]');
            if (isSaved) {
                Utils.disable(submitBtn);
                submitBtn.innerHTML = '<i class="bi bi-check-circle-fill"></i> <span>Reporte Guardado</span>';
                submitBtn.classList.remove('btn-success');
                submitBtn.classList.add('btn-secondary');
            } else {
                Utils.enable(submitBtn);
                submitBtn.innerHTML = 'Guardar Reporte'; // O el texto inicial
                submitBtn.classList.remove('btn-secondary');
                submitBtn.classList.add('btn-success');
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
                    Utils.showAlert('No se encontraron datos para esta ubicación.');
                    window.history.back();
                }
            } catch (error) {
                console.error('Error cargando datos de ubicación:', error);
                Utils.showAlert('Error al cargar la información de la ubicación: ' + error.message);
                window.history.back();
            }
        },

        sendReporte: async () => {
            if (!Elements.fotoInput.value) {
                Utils.showAlert('Debes tomar una fotografía antes de guardar el reporte');
                return;
            }
            if (!Elements.observacion.value.trim()) {
                Utils.showAlert('Debes ingresar una descripción antes de guardar el reporte');
                return;
            }

            const formData = new FormData(Elements.reporteForm);
            try {
                const blob = Utils.dataURLtoBlob(Elements.fotoInput.value);
                formData.append('foto', blob, 'foto_reporte.jpg');
            } catch (error) {
                Utils.showAlert('Error al procesar la fotografía: ' + error.message);
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
                Utils.enable(Elements.btnIncidencia);
                UIManager.updateReporteSubmitButton(true);

                Utils.show(Elements.finalizarContainer);
                ValidationModule.validateReportFields();

                Utils.showAlert('¡Reporte guardado exitosamente! Ahora puedes agregar incidencias si es necesario o finalizar.', 'success');

            } catch (error) {
                console.error('Error al guardar reporte:', error);
                Utils.showAlert('Error al guardar: ' + error.message);
            } finally {
                Utils.setLoadingState(false);
            }
        },

        sendIncidencia: async () => {
            if (!reporteGuardado || !Elements.reporteForm.dataset.reporteId) {
                Utils.showAlert('Primero debes guardar el reporte antes de agregar una incidencia');
                return;
            }
            if (!Elements.descripcionIncidencia.value.trim()) {
                Utils.showAlert('Debes ingresar una descripción para la incidencia');
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
                    Utils.showAlert('Error al procesar foto de incidencia: ' + error.message);
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
                    Utils.showAlert('¡Incidencia reportada exitosamente!', 'success');
                    UIManager.resetIncidenciaForm();
                    Elements.incidenciaModal.hide();

                    setTimeout(() => {
                        window.location.href = `ubicacionesRuta.php?id_rondin=${rondinId}`;
                    }, 1000);
                } else {
                    throw new Error(data.message || 'Error desconocido al guardar incidencia');
                }
            } catch (error) {
                console.error('Error enviando incidencia:', error);
                Utils.showAlert('Error al reportar incidencia: ' + error.message);
            } finally {
                Utils.setLoadingState(false);
            }
        }
    };

    // --- Módulo de Validación ---
    const ValidationModule = {
        validateFullReport: () => {
            if (!reporteGuardado) {
                Utils.showAlert('Primero debes guardar el reporte correctamente antes de finalizar');
                return false;
            }
            if (!Elements.observacion.value.trim()) {
                Utils.showAlert('Debes completar la descripción del reporte antes de finalizar');
                return false;
            }
            if (!Elements.fotoInput.value) {
                Utils.showAlert('Debes tomar una fotografía del reporte antes de finalizar');
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
            Elements.backBtn.addEventListener('click', () => window.history.back());

            // Configuración de la Cámara Principal
            Elements.startCameraMain.addEventListener('click', async () => {
                try {
                    await CameraModule.initCamera(Elements.videoMain);
                    Utils.show(Elements.videoMain);
                    Utils.hide(Elements.startCameraMain);
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
                ValidationModule.validateReportFields();
            });

            // Configuración de la Cámara de Incidencia
            Elements.startCameraModal.addEventListener('click', async () => {
                try {
                    await CameraModule.initCamera(Elements.videoModal);
                    Utils.show(Elements.videoModal);
                    Utils.hide(Elements.startCameraModal);
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
                Utils.show(Elements.startCameraModal);
            });

Elements.incidenciaModal._element.addEventListener('hidden.bs.modal', () => {
    CameraModule.stopCamera();
    EventHandlers.resetIncidenciaCameraUI();
});

            Elements.reporteForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                await DataService.sendReporte();
            });

            Elements.incidenciaForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                await DataService.sendIncidencia();
            });

Elements.incidenciaModal._element.addEventListener('show.bs.modal', function() {
    if (reporteGuardado && Elements.reporteForm.dataset.reporteId) {
        Elements.incidenciaReporteId.value = Elements.reporteForm.dataset.reporteId;
    }
});

            Elements.finalizarBtn.addEventListener('click', () => {
                if (!ValidationModule.validateFullReport()) {
                    return;
                }

                if (confirm('¿Estás seguro de que deseas finalizar y regresar a la lista de ubicaciones?')) {
                    window.location.href = `ubicacionesRuta.php?id_rondin=${rondinId}`;
                }
            });

            // Validación en tiempo real
            Elements.observacion.addEventListener('input', ValidationModule.validateReportFields);
            Elements.fotoInput.addEventListener('change', ValidationModule.validateReportFields);
        },

        resetIncidenciaCameraUI: () => {
            Utils.hide(Elements.videoModal);
            Utils.hide(Elements.takePhotoBtnModal);
            Utils.show(Elements.startCameraModal);
        }
    };

    // --- Función de Inicialización ---
    function init() {
        EventHandlers.setupListeners();

        if (ubicacionId && rondinId) {
            Elements.idUbicacionInput.value = ubicacionId;
            Elements.idRondinInput.value = rondinId;
            Elements.incidenciaIdUbicacionInput.value = ubicacionId;
            Elements.incidenciaIdRondinInput.value = rondinId;
            DataService.loadUbicacionData(ubicacionId);
        } else {
            Utils.showAlert('Error: ID de ubicación o rondín no especificado.');
            window.history.back();
        }

        // Deshabilitar botones inicialmente
        Utils.disable(Elements.btnIncidencia);
        Utils.disable(Elements.finalizarBtn);
        Utils.hide(Elements.finalizarContainer);
    }

    // Inicializar la aplicación
    init();
});