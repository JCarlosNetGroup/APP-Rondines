document.addEventListener('DOMContentLoaded', function() {
    // Obtener parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const ubicacionId = urlParams.get('id_ubicacion');
    const rondinId = urlParams.get('id_rondin');

    // Elementos del DOM
    const elements = {
        // Elementos generales
        backBtn: document.getElementById('back-btn'),
        ubicacionNombreHeader: document.getElementById('ubicacion-nombre-header'),
        ubicacionNombre: document.getElementById('ubicacion-nombre'),
        ubicacionDescripcion: document.getElementById('ubicacion-descripcion'),
        idUbicacionInput: document.getElementById('id-ubicacion'),
        idRondinInput: document.getElementById('id-rondin'),
        observacion: document.getElementById('observacion'),
        reporteForm: document.getElementById('reporte-form'),
        
        // Elementos para la cámara principal
        fotoInput: document.getElementById('foto'),
        photoPreview: document.getElementById('photo-preview'),
        startCameraMain: document.getElementById('start-camera-main'),
        videoMain: document.getElementById('video-main'),
        takePhotoBtnMain: document.getElementById('take-photo-btn-main'),
        canvasMain: document.getElementById('canvas-main'),
        
        // Elementos para incidencias
        incidenciaModal: new bootstrap.Modal(document.getElementById('incidenciaModal')),
        incidenciaForm: document.getElementById('incidencia-form'),
        incidenciaIdUbicacionInput: document.getElementById('incidencia-id-ubicacion'),
        incidenciaIdRondinInput: document.getElementById('incidencia-id-rondin'),
        descripcionIncidencia: document.getElementById('descripcion-incidencia'),
        incidenciaPhotoPreview: document.getElementById('incidencia-photo-preview'),
        fotoIncidenciaInput: document.getElementById('foto-incidencia'),
        
        // Elementos para cámara de incidencia
        startCameraModal: document.getElementById('start-camera'),
        videoModal: document.getElementById('video'),
        takePhotoBtnModal: document.getElementById('take-photo-btn-modal'),
        canvasModal: document.getElementById('canvas')
    };

    let ubicacionData = null;
    let currentStream = null;

    // Inicialización
    init();

    function init() {
        setupEventListeners();
        
        if (ubicacionId && rondinId) {
            elements.idUbicacionInput.value = ubicacionId;
            elements.idRondinInput.value = rondinId;
            elements.incidenciaIdUbicacionInput.value = ubicacionId;
            elements.incidenciaIdRondinInput.value = rondinId;
            cargarDatosUbicacion(ubicacionId);
        } else {
            mostrarError('Error: ID de ubicación o rondín no especificado.');
            window.history.back();
        }
    }

    // Configurar event listeners
    function setupEventListeners() {
        // Botón de regreso
        elements.backBtn.addEventListener('click', () => window.history.back());

        // Configuración para la cámara principal
        configurarCamaraPrincipal();
        
        // Configuración para la cámara de incidencias
        configurarCamaraIncidencia();
        
        // Manejo de envío de formularios
        elements.reporteForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            await enviarReporte();
        });

        elements.incidenciaForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            await enviarIncidencia();
        });
    }

    // Configurar cámara principal
    function configurarCamaraPrincipal() {
        elements.startCameraMain.addEventListener('click', async () => {
            try {
                await iniciarCamara(elements.videoMain);
                elements.videoMain.style.display = 'block';
                elements.startCameraMain.style.display = 'none';
                elements.takePhotoBtnMain.style.display = 'block';
            } catch (error) {
                manejarErrorCamara(error);
            }
        });

        elements.takePhotoBtnMain.addEventListener('click', () => {
            tomarFoto(
                elements.videoMain, 
                elements.canvasMain, 
                elements.photoPreview, 
                elements.fotoInput
            );
            detenerCamara();
            elements.videoMain.style.display = 'none';
            elements.takePhotoBtnMain.style.display = 'none';
            elements.startCameraMain.style.display = 'block';
        });
    }

    // Configurar cámara de incidencia
    function configurarCamaraIncidencia() {
        elements.startCameraModal.addEventListener('click', async () => {
            try {
                await iniciarCamara(elements.videoModal);
                elements.videoModal.style.display = 'block';
                elements.startCameraModal.style.display = 'none';
                elements.takePhotoBtnModal.style.display = 'block';
            } catch (error) {
                manejarErrorCamara(error);
            }
        });

        elements.takePhotoBtnModal.addEventListener('click', () => {
            tomarFoto(
                elements.videoModal, 
                elements.canvasModal, 
                elements.incidenciaPhotoPreview, 
                elements.fotoIncidenciaInput
            );
            detenerCamara();
            elements.videoModal.style.display = 'none';
            elements.takePhotoBtnModal.style.display = 'none';
            elements.startCameraModal.style.display = 'block';
        });

        // Cerrar cámara cuando se cierra el modal
        document.getElementById('incidenciaModal').addEventListener('hidden.bs.modal', function () {
            detenerCamara();
            resetearCamaraIncidencia();
        });
    }

    // Funciones para manejo de cámara
    async function iniciarCamara(videoElement) {
        detenerCamara();
        const constraints = {
            video: { 
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        currentStream = stream;
        videoElement.srcObject = stream;
        
        return new Promise((resolve) => {
            videoElement.onloadedmetadata = () => {
                resolve();
            };
        });
    }

    function tomarFoto(videoElement, canvasElement, previewElement, inputElement) {
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        const context = canvasElement.getContext('2d');
        
        // Ajustar el canvas al tamaño del video manteniendo la relación de aspecto
        context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        
        // Reducir calidad para optimizar tamaño
        const imageDataUrl = canvasElement.toDataURL('image/jpeg', 0.7);
        
        // Mostrar previsualización y guardar en input
        previewElement.src = imageDataUrl;
        previewElement.style.display = 'block';
        inputElement.value = imageDataUrl;
    }

    function detenerCamara() {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
            currentStream = null;
        }
    }

    function resetearCamaraIncidencia() {
        elements.videoModal.style.display = 'none';
        elements.takePhotoBtnModal.style.display = 'none';
        elements.startCameraModal.style.display = 'block';
    }

    function manejarErrorCamara(error) {
        console.error("Error al acceder a la cámara:", error);
        mostrarError("No se pudo acceder a la cámara. Asegúrate de conceder los permisos necesarios.");
    }

    // Cargar datos de ubicación
    async function cargarDatosUbicacion(idUbicacion) {
        try {
            const response = await fetch(`../controller/geUbicacionForm.php?id_ubicacion=${idUbicacion}&id_rondin=${rondinId}`);
            
            if (!response.ok) {
                throw new Error('No se pudo cargar la información de la ubicación.');
            }
            
            const data = await response.json();
            
            if (data.success && data.ubicacion) {
                ubicacionData = data.ubicacion;
                actualizarUIUbicacion();
            } else {
                mostrarError('No se encontraron datos para esta ubicación.');
                window.history.back();
            }
        } catch (error) {
            console.error('Error cargando datos de ubicación:', error);
            mostrarError('Error al cargar la información de la ubicación: ' + error.message);
            window.history.back();
        }
    }

    function actualizarUIUbicacion() {
        elements.ubicacionNombre.textContent = ubicacionData.nombre || 'N/A';
        elements.ubicacionDescripcion.textContent = ubicacionData.descripcion || 'Sin descripción';
        
        // Actualizar header si es necesario
        if (ubicacionData.nombre) {
            elements.ubicacionNombreHeader.textContent = ubicacionData.nombre;
        }
    }

    // Enviar reporte principal
    async function enviarReporte() {
        const formData = new FormData(elements.reporteForm);
        
        // Convertir foto DataURL a Blob si existe
        if (elements.fotoInput.value) {
            const blob = dataURLtoBlob(elements.fotoInput.value);
            formData.append('foto', blob, 'foto_reporte.jpg');
        }
        
        try {
            mostrarCargando(true);
            
            const response = await fetch('../controller/guardarReporte.php', {
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

            // Almacenar el ID del reporte para posibles incidencias
            elements.reporteForm.dataset.reporteId = data.reporte_id;
            
            mostrarExito('Reporte guardado exitosamente!');
            window.location.href = `ubicacionesRuta.php?id_rondin=${rondinId}`;
            
        } catch (error) {
            console.error('Error al guardar reporte:', error);
            mostrarError('Error al guardar: ' + error.message);
        } finally {
            mostrarCargando(false);
        }
    }

    // Enviar incidencia
    async function enviarIncidencia() {
        const reporteId = elements.reporteForm.dataset.reporteId;
        if (!reporteId) {
            mostrarError('Primero debes guardar el reporte antes de agregar una incidencia');
            return;
        }

        const formData = new FormData(elements.incidenciaForm);
        formData.append('reporte_id', reporteId);
        formData.append('riesgo', document.querySelector('input[name="riesgo"]:checked').value);
        
        // Convertir foto de incidencia DataURL a Blob si existe
        if (elements.fotoIncidenciaInput.value) {
            const blob = dataURLtoBlob(elements.fotoIncidenciaInput.value);
            formData.append('foto_incidencia', blob, 'foto_incidencia.jpg');
        }

        try {
            mostrarCargando(true);
            
            const response = await fetch('../controller/guardarIncidencia.php', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                mostrarExito('Incidencia reportada exitosamente!');
                resetearFormularioIncidencia();
                elements.incidenciaModal.hide();
            } else {
                throw new Error(data.message || 'Error desconocido');
            }
        } catch (error) {
            console.error('Error enviando incidencia:', error);
            mostrarError('Error al reportar incidencia: ' + error.message);
        } finally {
            mostrarCargando(false);
        }
    }

    // Funciones auxiliares
    function dataURLtoBlob(dataURL) {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        
        return new Blob([u8arr], { type: mime });
    }

    function resetearFormularioIncidencia() {
        elements.incidenciaForm.reset();
        elements.incidenciaPhotoPreview.style.display = 'none';
        elements.incidenciaPhotoPreview.src = '#';
        elements.fotoIncidenciaInput.value = '';
    }

    function mostrarError(mensaje) {
        alert(mensaje); // Puedes reemplazar esto con un toast o modal más elegante
    }

    function mostrarExito(mensaje) {
        alert(mensaje); // Puedes reemplazar esto con un toast o modal más elegante
    }

    function mostrarCargando(mostrar) {
        // Implementar lógica para mostrar/ocultar spinner de carga
        if (mostrar) {
            console.log("Mostrando carga...");
        } else {
            console.log("Ocultando carga...");
        }
    }
});