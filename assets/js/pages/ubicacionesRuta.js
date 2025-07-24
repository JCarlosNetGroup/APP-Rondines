document.addEventListener('DOMContentLoaded', function () {
    // ========== CONSTANTES DE CONFIGURACIÓN ==========
    const CONFIG = {
        MAX_DISTANCE_METERS: 2000,
        QR_SCANNER_CONFIG: {
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
            experimentalFeatures: { useBarCodeDetectorIfSupported: true },
            verbose: false
        },
        CAMERA_CONFIG: {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            disableFlip: true
        },
        GEOLOCATION_OPTIONS: {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    };

    // ========== VARIABLES DE ESTADO ==========
    const state = {
        ubicacionesData: [],
        ubicacionesEscaneadas: [],
        totalUbicaciones: 0,
        html5QrCode: null,
        currentCameraId: null,
        currentUbicacion: null,
        isLoading: false,
        currentCycleId: null
    };

    // ========== ELEMENTOS DEL DOM ==========
    const DOM = {
        backBtn: document.getElementById('back-btn'),
        ubicacionesList: document.getElementById('ubicaciones-list'),
        emptyState: document.getElementById('empty-state'),
        qrScannerModal: new bootstrap.Modal(document.getElementById('qrScannerModal')),
        scannerError: document.getElementById('scanner-error'),
        qrScannerContainer: document.getElementById('qr-scanner-container'),
        modalCloseBtn: document.querySelector('#qrScannerModal .btn-close'),
        progressBar: document.getElementById('progress-bar'),
        loadingIndicator: document.getElementById('loading-indicator') || createLoadingIndicator()
    };

    // ========== INICIALIZACIÓN ==========
    init();

    async function init() {
        setupEventListeners();
        showLoading(true);

        state.currentCycleId = getCycleId();

        try {
            await loadScannedLocations();
            await loadLocations();
            prepareHistoryState();
            updateProgressBar();
        } catch (error) {
            handleLocationError(error);
        } finally {
            showLoading(false);
        }
    }

    // ========== FUNCIONES DE UTILIDAD PARA UI/UX ==========
    function createLoadingIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'loading-indicator';
        indicator.className = 'text-center py-4 d-none';
        indicator.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Cargando ubicaciones...</p>
        `;
        document.querySelector('main').prepend(indicator);
        return indicator;
    }

    function showLoading(show) {
        state.isLoading = show;
        if (show) {
            DOM.loadingIndicator.classList.remove('d-none');
            DOM.ubicacionesList.classList.add('d-none');
            DOM.emptyState.classList.add('d-none');
        } else {
            DOM.loadingIndicator.classList.add('d-none');
            DOM.ubicacionesList.classList.remove('d-none');
        }
    }

    // ========== MANEJO DE EVENTOS ==========
    function setupEventListeners() {
        DOM.backBtn.addEventListener('click', redirectToRondinesDia);
        DOM.ubicacionesList.addEventListener('click', handleLocationClick);

        if (DOM.qrScannerModal?._element) {
            DOM.qrScannerModal._element.addEventListener('shown.bs.modal', handleModalShown);
            DOM.qrScannerModal._element.addEventListener('hidden.bs.modal', handleModalHidden);
        }

        window.addEventListener('popstate', redirectToRondinesDia);
    }

    // ========== MANEJO DE EVENTOS DEL MODAL ==========
    async function handleModalShown() {
        DOM.scannerError.classList.add('d-none');

        if (!state.currentUbicacion) {
            showScannerError('No se ha seleccionado una ubicación válida para escanear.');
            return;
        }

        try {
            await stopScannerIfRunning();
            DOM.qrScannerContainer.innerHTML = '';
            await initializeScanner();
        } catch (error) {
            handleScannerError(error);
        }
    }

    async function handleModalHidden() {
        setTimeout(async () => {
            try {
                await stopScannerIfRunning();
                DOM.scannerError.classList.add('d-none');
                if (DOM.qrScannerContainer) {
                    DOM.qrScannerContainer.innerHTML = '';
                }
            } catch (error) {
                console.error('Error al limpiar el escáner:', error);
            }
        }, 300);
    }

    // ========== FUNCIONES PRINCIPALES ==========
    function redirectToRondinesDia() {
        const rondinId = getRondinId();
        const url = rondinId
            ? `../pages/rondinesDia.php?id_rondin=${rondinId}`
            : '../pages/rondinesDia.php';
        window.location.replace(url);
    }

    function prepareHistoryState() {
        const rondinId = getRondinId();
        const currentUrl = rondinId && state.currentCycleId
            ? `${window.location.pathname}?id_rondin=${rondinId}&cycle_id=${state.currentCycleId}`
            : window.location.pathname;

        window.history.replaceState({ rondinId, cycleId: state.currentCycleId }, document.title, currentUrl);
    }

    // ========== GESTIÓN DE UBICACIONES ==========
    async function loadScannedLocations() {
        const rondinId = getRondinId();
        const cycleId = state.currentCycleId;

        if (!rondinId || cycleId === null) {
            console.warn('No hay ID de rondín o ID de ciclo. No se cargarán ubicaciones escaneadas.');
            state.ubicacionesEscaneadas = [];
            state.totalUbicaciones = 0;
            return;
        }

        try {
            const response = await fetch(`../controller/getRutaProgress.php?id_rondin=${rondinId}&cycle_id=${cycleId}`);
            if (!response.ok) throw new Error('Error en la respuesta del servidor');

            const data = await response.json();
            if (!data.success) throw new Error(data.message || 'Error en los datos de progreso');

            state.ubicacionesEscaneadas = Array.isArray(data.ubicacionesEscaneadas)
                ? data.ubicacionesEscaneadas.map(String).filter(id => id)
                : [];
            state.totalUbicaciones = Math.max(0, parseInt(data.totalUbicaciones)) || 0;

        } catch (error) {
            console.error('Error al cargar ubicaciones escaneadas del servidor:', error);
            state.ubicacionesEscaneadas = [];
            state.totalUbicaciones = 0;
            
            Swal.fire({
                title: 'Error de conexión',
                text: 'No se pudo obtener el progreso del rondín. Por favor, verifica tu conexión e intenta nuevamente.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    }

    function updateProgressBar() {
        const progressBarElement = document.getElementById('global-progress-bar');
        const progressTextElement = document.getElementById('progress-text');

        if (!progressBarElement || !progressTextElement) return;

        const completadas = state.ubicacionesEscaneadas.length;
        const total = state.totalUbicaciones || 1;
        const porcentaje = Math.round((completadas / total) * 100);

        progressBarElement.style.width = `${porcentaje}%`;
        progressBarElement.setAttribute('aria-valuenow', porcentaje);
        progressTextElement.textContent = `${completadas}/${total} ubicaciones (${porcentaje}%)`;
    }

    async function loadLocations() {
        const rondinId = getRondinId();
        if (!rondinId) {
            showErrorState('No se ha especificado un ID de rondín.');
            return;
        }

        try {
            const response = await fetch(`../controller/getUbicacionesRuta.php?id_rondin=${rondinId}`);
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

            const data = await response.json();
            if (!data.success || !Array.isArray(data.ubicaciones)) {
                throw new Error(data.message || 'Datos de ubicación inválidos');
            }

            processLocationData(data.ubicaciones);
            renderLocations();
            DOM.emptyState.classList.add('d-none');
        } catch (error) {
            handleLocationError(error);
        }
    }

    function processLocationData(locations) {
        state.ubicacionesData = locations
            .map(ubicacion => ({
                id: ubicacion.id_ubicacion.toString(),
                nombre: ubicacion.nombre || 'Sin nombre',
                descripcion: ubicacion.descripcion || 'Sin descripción',
                latitud: parseFloat(ubicacion.latitud),
                longitud: parseFloat(ubicacion.longitud),
                rawData: ubicacion
            }))
            .filter(ubicacion => (
                ubicacion.id &&
                !isNaN(ubicacion.latitud) &&
                !isNaN(ubicacion.longitud)
            ));

        if (state.ubicacionesData.length === 0) {
            console.warn('No se encontraron ubicaciones válidas para este rondín.');
        }
    }

    function renderLocations() {
        DOM.ubicacionesList.innerHTML = '';
        if (state.ubicacionesData.length === 0) {
            DOM.emptyState.classList.remove('d-none');
            DOM.emptyState.innerHTML = `
                <div class="text-center">
                    <i class="bi bi-info-circle fs-1 text-info"></i>
                    <p class="mt-3">No hay ubicaciones asignadas a este rondín.</p>
                </div>
            `;
            return;
        }

        state.ubicacionesData.forEach((ubicacion, index) => {
            const ubicacionId = String(ubicacion.id);
            const isPreviousScanned = index > 0 && state.ubicacionesEscaneadas.includes(String(state.ubicacionesData[index - 1].id));
            const isScanned = state.ubicacionesEscaneadas.includes(ubicacionId);
            const isEnabled = (index === 0 && !isScanned) || (index > 0 && isPreviousScanned && !isScanned);

            const item = document.createElement('div');
            item.className = `list-group-item list-group-item-action ${!isEnabled || isScanned ? 'disabled' : ''} ${isScanned ? 'bg-light' : ''}`;
            item.innerHTML = `
                <div class="d-flex w-100 justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <span class="badge me-3 ${isScanned ? 'bg-success' : 'bg-primary'}">${index + 1}</span>
                        <div>
                            <h5 class="mb-1 ${isScanned ? 'text-success' : ''}">
                                ${ubicacion.nombre}
                            </h5>
                            <small class="text-muted">${ubicacion.descripcion}</small>
                        </div>
                    </div>
                    ${getLocationIcon(isEnabled, isScanned)}
                </div>
            `;

            if (isEnabled && !isScanned) {
                item.addEventListener('click', () => startQRScanning(ubicacion));
            }

            DOM.ubicacionesList.appendChild(item);
        });

        checkAllLocationsCompleted();
        updateProgressBar();
    }

    // ========== FUNCIONES DE INTERFAZ ==========
    function handleLocationClick(event) {
        const clickedItem = event.target.closest('.list-group-item');
        if (!clickedItem || clickedItem.classList.contains('disabled')) return;

        const index = Array.from(DOM.ubicacionesList.children).indexOf(clickedItem);
        const ubicacion = state.ubicacionesData[index];

        if (!ubicacion) return;

        const isScanned = state.ubicacionesEscaneadas.includes(ubicacion.id);

        if (!isScanned) {
            startQRScanning(ubicacion);
        }
    }

    function getLocationIcon(isEnabled, isScanned) {
        if (isScanned) return '<i class="bi bi-check-circle-fill text-success fs-4"></i>';
        if (isEnabled) return '<i class="bi bi-qr-code fs-4"></i>';
        return '<i class="bi bi-lock-fill text-muted"></i>';
    }

    function checkAllLocationsCompleted() {
        if (state.totalUbicaciones === 0) return;

        const allCompleted = state.ubicacionesEscaneadas.length === state.totalUbicaciones;

        if (allCompleted) {
            setTimeout(() => {
                Swal.fire({
                    title: '¡Ruta Concluida!',
                    html: `Has completado todas las ${state.totalUbicaciones} ubicaciones de esta ruta.`,
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                    allowOutsideClick: false,
                    allowEscapeKey: false
                }).then(() => {
                    redirectToRondinesDia();
                });
            }, 500);
        }
    }

    // ========== ESCANEO QR ==========
    async function startQRScanning(ubicacion) {
        if (!validateLocationForScanning(ubicacion) || state.isLoading) return;

        state.currentUbicacion = ubicacion;
        DOM.scannerError.classList.add('d-none');
        DOM.qrScannerModal.show();
    }

    async function initializeScanner() {
        const permissionStatus = await navigator.permissions.query({ name: 'camera' });
        if (permissionStatus.state === 'denied') {
            throw new Error('Permiso de cámara denegado. Habilítalo en la configuración de tu navegador.');
        }

        state.html5QrCode = new Html5Qrcode("qr-scanner-container", CONFIG.QR_SCANNER_CONFIG);
        const cameras = await Html5Qrcode.getCameras();

        if (cameras.length === 0) throw new Error('No se detectaron cámaras disponibles.');
        state.currentCameraId = cameras.find(cam => cam.label.toLowerCase().includes('back'))?.id || cameras[0].id;

        await state.html5QrCode.start(
            state.currentCameraId,
            CONFIG.CAMERA_CONFIG,
            qrCodeData => verifyQR(qrCodeData),
            errorMessage => !errorMessage.includes('NotFoundException') && showScannerError(errorMessage)
        );
    }

    async function verifyQR(qrData) {
        try {
            const qrId = qrData.trim();
            if (qrId !== state.currentUbicacion.id) {
                throw new Error('El QR escaneado no coincide con esta ubicación.');
            }

            const position = await getCurrentPosition();
            const distance = calculateDistance(
                position.coords.latitude,
                position.coords.longitude,
                state.currentUbicacion.latitud,
                state.currentUbicacion.longitud
            );

            if (distance > CONFIG.MAX_DISTANCE_METERS) {
                throw new Error(`Estás a ${Math.round(distance)}m de la ubicación (máximo permitido: ${CONFIG.MAX_DISTANCE_METERS}m).`);
            }

            await handleSuccessfulScan();
        } catch (error) {
            showScannerError(error.message);
        }
    }

    async function handleSuccessfulScan() {
        await stopScannerIfRunning();
        DOM.qrScannerModal.hide();

        try {
            // Actualizar el estado local temporalmente para feedback visual
            const ubicacionId = state.currentUbicacion.id;
            if (!state.ubicacionesEscaneadas.includes(ubicacionId)) {
                state.ubicacionesEscaneadas.push(ubicacionId);
            }

            // Actualizar UI
            renderLocations();
            updateProgressBar();

            // Redirigir al formulario de reporte
            redirectToReportForm();

        } catch (error) {
            console.error('Error al procesar el escaneo:', error);
            Swal.fire({
                title: 'Error interno',
                text: 'Hubo un problema al procesar el escaneo. Intenta de nuevo.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    }

    function redirectToReportForm() {
        const rondinId = getRondinId();
        window.location.href = `../pages/formReporte.php?id_ubicacion=${state.currentUbicacion.id}&id_rondin=${rondinId}&cycle_id=${state.currentCycleId}&from_scan=true`;
    }

    // ========== UTILIDADES ==========
    function getRondinId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id_rondin');
    }

    function getCycleId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('cycle_id');
    }

    function validateLocationForScanning(ubicacion) {
        return !(!ubicacion?.id || isNaN(ubicacion.latitud) || isNaN(ubicacion.longitud));
    }

    async function stopScannerIfRunning() {
        if (state.html5QrCode?.isScanning) {
            await state.html5QrCode.stop();
        }
    }

    function getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocalización no soportada'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                position => resolve(position),
                error => reject(createGeolocationError(error)),
                CONFIG.GEOLOCATION_OPTIONS
            );
        });
    }

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3;
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    // ========== MANEJO DE ERRORES ==========
    function showErrorState(message) {
        DOM.emptyState.classList.remove('d-none');
        DOM.emptyState.innerHTML = `
            <div class="text-center">
                <i class="bi bi-exclamation-triangle-fill text-danger fs-1"></i>
                <p class="mt-3">${message}</p>
                <button class="btn btn-primary mt-2" onclick="location.reload()">
                    <i class="bi bi-arrow-repeat"></i> Intentar nuevamente
                </button>
            </div>
        `;
        DOM.ubicacionesList.innerHTML = '';
    }

    function handleLocationError(error) {
        console.error('Error al cargar ubicaciones:', error);
        showErrorState(`Error al cargar las ubicaciones: ${error.message}`);
    }

    function showScannerError(message) {
        const errorMap = {
            'No se detectaron cámaras disponibles': 'No se encontró una cámara disponible',
            'Permission denied': 'Permiso de cámara denegado - actívalo en configuración',
            'Requested device not found': 'Cámara no accesible - verifica que no esté en uso',
            'El QR escaneado no coincide con esta ubicación': 'QR incorrecto - escanea el código correcto',
            'Estás a': 'Demasiado lejos - acércate para escanear',
            'QR code parse error, error = R no Multiformat': 'Error de lectura QR - enfoca mejor el código',
            'QR code parse error': 'Problema al leer QR - mantén el código enfocado'
        };

        const friendlyMessage = Object.entries(errorMap).reduce((msg, [key, value]) =>
            message.includes(key) ? value : msg, message);

        if (!friendlyMessage) return;

        DOM.scannerError.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi bi-exclamation-triangle-fill me-2" style="color:rgb(7, 106, 255);"></i>
                <span>${friendlyMessage}</span>
            </div>
        `;
        DOM.scannerError.className = 'alert alert-info mt-3';
        DOM.scannerError.classList.remove('d-none');
    }

    function handleScannerError(error) {
        console.error('Error del escáner:', error);
        showScannerError(error.message);
    }

    function createGeolocationError(error) {
        const messages = {
            [error.PERMISSION_DENIED]: 'Activa los permisos de ubicación',
            [error.POSITION_UNAVAILABLE]: 'Ubicación no disponible - mejora tu señal GPS',
            [error.TIMEOUT]: 'Tiempo de espera agotado - verifica tu conexión',
            default: `Error de geolocalización (código: ${error.code})`
        };
        return new Error(messages[error.code] || messages.default);
    }
});