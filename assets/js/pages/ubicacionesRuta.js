document.addEventListener('DOMContentLoaded', function() {
    // ========== CONSTANTES DE CONFIGURACIÓN ==========
    const CONFIG = {
        MAX_DISTANCE_METERS: 5000,
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
        html5QrCode: null,
        currentCameraId: null,
        currentUbicacion: null
    };

    // ========== ELEMENTOS DEL DOM ==========
    const DOM = {
        backBtn: document.getElementById('back-btn'),
        ubicacionesList: document.getElementById('ubicaciones-list'),
        emptyState: document.getElementById('empty-state'),
        qrScannerModal: new bootstrap.Modal(document.getElementById('qrScannerModal')),
        scannerError: document.getElementById('scanner-error'),
        qrScannerContainer: document.getElementById('qr-scanner-container'),
        switchCameraBtn: document.getElementById('switch-camera-btn'),
        torchBtn: document.getElementById('torch-btn'),
        modalCloseBtn: document.querySelector('#qrScannerModal .btn-close')
    };

    // ========== INICIALIZACIÓN ==========
    init();

    function init() {
        setupEventListeners();
        loadScannedLocations();
        loadLocations();
    }

    // ========== MANEJO DE EVENTOS ==========
    function setupEventListeners() {
        // Navegación
        DOM.backBtn.addEventListener('click', () => window.history.back());

        // Lista de ubicaciones
        DOM.ubicacionesList.addEventListener('click', handleLocationClick);

        // Eventos del modal del escáner QR
        DOM.qrScannerModal._element.addEventListener('shown.bs.modal', handleModalShown);
        DOM.qrScannerModal._element.addEventListener('hidden.bs.modal', handleModalHidden);

        // Botones de control del escáner
        DOM.switchCameraBtn.addEventListener('click', switchCamera);
        DOM.torchBtn.addEventListener('click', toggleTorch);
    }

    function handleLocationClick(event) {
        const clickedItem = event.target.closest('.list-group-item');
        if (!clickedItem) return;

        const index = Array.from(DOM.ubicacionesList.children).indexOf(clickedItem);
        const ubicacion = state.ubicacionesData[index];
        if (!ubicacion) return;

        const isEnabled = index === 0 || 
                         (index > 0 && state.ubicacionesEscaneadas.includes(state.ubicacionesData[index - 1].id));
        const isScanned = state.ubicacionesEscaneadas.includes(ubicacion.id);

        if (isEnabled && !isScanned) {
            startQRScanning(ubicacion);
        }
    }

    function handleModalShown() {
        DOM.modalCloseBtn.focus();
    }

    async function handleModalHidden() {
        try {
            if (state.html5QrCode?.isScanning) {
                await state.html5QrCode.stop();
                DOM.qrScannerContainer.innerHTML = '';
                state.currentCameraId = null;
                DOM.torchBtn.classList.add('d-none');
            }
        } catch (err) {
            console.error("Error al detener el escáner:", err);
        }
    }

    // ========== GESTIÓN DE UBICACIONES ==========
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

    function getRondinId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id_rondin');
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
            throw new Error('No se encontraron ubicaciones válidas');
        }
    }

    function renderLocations() {
        DOM.ubicacionesList.innerHTML = '';
        if (state.ubicacionesData.length === 0) {
            DOM.emptyState.classList.remove('d-none');
            return;
        }

        state.ubicacionesData.forEach((ubicacion, index) => {
            const isEnabled = index === 0 || 
                            (index > 0 && state.ubicacionesEscaneadas.includes(state.ubicacionesData[index - 1].id));
            const isScanned = state.ubicacionesEscaneadas.includes(ubicacion.id);

            const item = document.createElement('div');
            item.className = `list-group-item list-group-item-action ${!isEnabled ? 'disabled' : ''} ${isScanned ? 'bg-light' : ''}`;
            
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

            DOM.ubicacionesList.appendChild(item);
        });
    }

    function getLocationIcon(isEnabled, isScanned) {
        if (isEnabled && !isScanned) return '<i class="bi bi-qr-code fs-4"></i>';
        if (isScanned) return '<i class="bi bi-check-circle-fill text-success fs-4"></i>';
        return '<i class="bi bi-lock-fill text-muted"></i>';
    }

    function loadScannedLocations() {
        const rondinId = getRondinId();
        if (!rondinId) return;

        try {
            const escaneadas = localStorage.getItem(`rondin_${rondinId}_escaneadas`);
            state.ubicacionesEscaneadas = escaneadas ? JSON.parse(escaneadas) : [];
            
            if (!Array.isArray(state.ubicacionesEscaneadas)) {
                state.ubicacionesEscaneadas = [];
            }
        } catch (e) {
            console.error('Error al cargar ubicaciones escaneadas:', e);
            state.ubicacionesEscaneadas = [];
        }
    }

    function saveScannedLocation(ubicacionId) {
        const rondinId = getRondinId();
        if (!rondinId || state.ubicacionesEscaneadas.includes(ubicacionId)) return;

        state.ubicacionesEscaneadas.push(ubicacionId);
        localStorage.setItem(`rondin_${rondinId}_escaneadas`, JSON.stringify(state.ubicacionesEscaneadas));
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

    // ========== ESCANEO QR ==========
    async function startQRScanning(ubicacion) {
        if (!validateLocationForScanning(ubicacion)) return;

        state.currentUbicacion = ubicacion;
        DOM.scannerError.classList.add('d-none');
        DOM.qrScannerModal.show();

        try {
            await stopScannerIfRunning();
            DOM.qrScannerContainer.innerHTML = '';

            await initializeScanner();
        } catch (error) {
            handleScannerError(error);
        }
    }

    function validateLocationForScanning(ubicacion) {
        if (!ubicacion?.id || isNaN(ubicacion.latitud) || isNaN(ubicacion.longitud)) {
            showScannerError('Datos de ubicación inválidos para escaneo.');
            return false;
        }
        return true;
    }

    async function stopScannerIfRunning() {
        if (state.html5QrCode?.isScanning) {
            await state.html5QrCode.stop();
        }
    }

    async function initializeScanner() {
        state.html5QrCode = new Html5Qrcode("qr-scanner-container", CONFIG.QR_SCANNER_CONFIG);

        const cameras = await Html5Qrcode.getCameras();
        if (cameras.length === 0) throw new Error('No se detectaron cámaras disponibles.');

        state.currentCameraId = cameras.find(cam => cam.label.toLowerCase().includes('back'))?.id || cameras[0].id;
        DOM.switchCameraBtn.classList.toggle('d-none', cameras.length <= 1);

        await state.html5QrCode.start(
            state.currentCameraId,
            CONFIG.CAMERA_CONFIG,
            qrCodeData => verifyQR(qrCodeData),
            errorMessage => !errorMessage.includes('NotFoundException') && showScannerError(errorMessage)
        );

        setupScannerControls();
    }

    function setupScannerControls() {
        if (state.html5QrCode.getRunningTrackCapabilities()?.torch) {
            DOM.torchBtn.classList.remove('d-none');
        } else {
            DOM.torchBtn.classList.add('d-none');
        }
    }

    async function switchCamera() {
        try {
            const cameras = await Html5Qrcode.getCameras();
            if (cameras.length <= 1) return;

            const currentIndex = cameras.findIndex(cam => cam.id === state.currentCameraId);
            const nextIndex = (currentIndex + 1) % cameras.length;
            state.currentCameraId = cameras[nextIndex].id;

            await stopScannerIfRunning();
            await initializeScanner();
        } catch (error) {
            handleScannerError(error);
        }
    }

    async function toggleTorch() {
        try {
            const isTorchOn = DOM.torchBtn.classList.contains('active');
            
            if (isTorchOn) {
                await state.html5QrCode.turnOffFlash();
                DOM.torchBtn.classList.remove('active');
                DOM.torchBtn.innerHTML = '<i class="bi bi-lightbulb"></i> Flash';
            } else {
                await state.html5QrCode.turnOnFlash();
                DOM.torchBtn.classList.add('active');
                DOM.torchBtn.innerHTML = '<i class="bi bi-lightbulb-fill"></i> Flash';
            }
        } catch (error) {
            handleScannerError(error);
        }
    }

    // ========== VERIFICACIÓN QR ==========
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
        saveScannedLocation(state.currentUbicacion.id);
        renderLocations();
        
        await stopScannerIfRunning();
        DOM.qrScannerModal.hide();
        
        redirectToReportForm();
    }

    function redirectToReportForm() {
        const rondinId = getRondinId();
        window.location.href = `/Centinela/pages/formReporte.php?id_ubicacion=${state.currentUbicacion.id}&id_rondin=${rondinId}`;
    }

    // ========== GEOLOCALIZACIÓN ==========
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

    function createGeolocationError(error) {
        const messages = {
            [error.PERMISSION_DENIED]: 'Activa los permisos de ubicación',
            [error.POSITION_UNAVAILABLE]: 'Ubicación no disponible - mejora tu señal GPS',
            [error.TIMEOUT]: 'Tiempo de espera agotado - verifica tu conexión',
            default: `Error de geolocalización (código: ${error.code})`
        };

        return new Error(messages[error.code] || messages.default);
    }

    // ========== CÁLCULO DE DISTANCIA ==========
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Radio de la Tierra en metros
        const φ1 = lat1 * Math.PI/180;
        const φ2 = lat2 * Math.PI/180;
        const Δφ = (lat2 - lat1) * Math.PI/180;
        const Δλ = (lon2 - lon1) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c;
    }

    // ========== MANEJO DE MENSAJES DE ERROR ==========
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
});