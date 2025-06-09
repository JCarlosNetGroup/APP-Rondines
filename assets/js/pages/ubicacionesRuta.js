document.addEventListener('DOMContentLoaded', function() {
    // Configuración
    const DISTANCIA_MAXIMA_METROS = 5000; // Puedes ajustar esta distancia
    const urlParams = new URLSearchParams(window.location.search);
    const rondinId = urlParams.get('id_rondin');
    
    // Estado
    let ubicacionesData = [];
    let ubicacionesEscaneadas = [];
    let html5QrCode = null;
    let currentCameraId = null;

    // Elementos del DOM
    const elements = {
        backBtn: document.getElementById('back-btn'),
        ubicacionesList: document.getElementById('ubicaciones-list'),
        emptyState: document.getElementById('empty-state'),
        qrScannerModal: new bootstrap.Modal(document.getElementById('qrScannerModal')),
        scannerError: document.getElementById('scanner-error'),
        qrScannerContainer: document.getElementById('qr-scanner-container'),
        switchCameraBtn: document.getElementById('switch-camera-btn'),
        torchBtn: document.getElementById('torch-btn')
    };

    // Inicialización
    init();

    function init() {
        setupEventListeners();
        cargarUbicacionesEscaneadas();
        cargarUbicaciones();
    }

    function setupEventListeners() {
        elements.backBtn.addEventListener('click', () => window.history.back());

        elements.ubicacionesList.addEventListener('click', (event) => {
            const clickedItem = event.target.closest('.list-group-item');
            if (clickedItem) {
                // Obtener el índice del elemento clickeado para acceder a ubicacionesData
                const index = Array.from(elements.ubicacionesList.children).indexOf(clickedItem);
                const ubicacion = ubicacionesData[index];
                
                if (ubicacion) {
                    // Determinar si la ubicación está habilitada para escanear
                    const isEnabled = index === 0 || // La primera ubicación siempre está habilitada
                                     (index > 0 && ubicacionesEscaneadas.includes(ubicacionesData[index - 1].id));
                    const isScanned = ubicacionesEscaneadas.includes(ubicacion.id);

                    if (isEnabled && !isScanned) {
                        // Si está habilitada y no escaneada, iniciar el escaneo QR
                        iniciarEscaneoQR(ubicacion);
                    } else if (isScanned) {
                        // Si ya está escaneada, puedes redirigir directamente al reporte si lo deseas
                        // o simplemente no hacer nada (como está actualmente)
                        // window.location.href = `/Centinela/pages/formReporte.php?id_ubicacion=${ubicacion.id}&id_rondin=${rondinId}`;
                    }
                }
            }
        });

        // Eventos del modal del escáner QR
        elements.qrScannerModal._element.addEventListener('shown.bs.modal', () => {
            // Pone el foco en el botón de cerrar para mejorar accesibilidad
            document.querySelector('#qrScannerModal .btn-close').focus();
        });

        elements.qrScannerModal._element.addEventListener('hidden.bs.modal', async () => {
            // Detener el escáner cuando el modal se cierra
            if (html5QrCode && html5QrCode.isScanning) {
                try {
                    await html5QrCode.stop();
                    elements.qrScannerContainer.innerHTML = ''; // Limpiar el contenedor de video
                    currentCameraId = null; // Reiniciar la cámara actual
                    elements.torchBtn.classList.add('d-none'); // Ocultar el botón de flash
                } catch (err) {
                    console.error("Error al detener el escáner:", err);
                }
            }
            // Regresar el foco al elemento que abrió el modal (si aplica)
            document.querySelector('button[data-bs-target="#qrScannerModal"]')?.focus();
        });

        // Botones de control del escáner
        elements.switchCameraBtn.addEventListener('click', switchCamera);
        elements.torchBtn.addEventListener('click', toggleTorch);
    }

    async function cargarUbicaciones() {
        if (!rondinId) {
            showErrorState('No se ha especificado un ID de rondín. Asegúrate de que la URL contenga `?id_rondin=X`.');
            return;
        }

        try {
            const response = await fetch(`../controller/getUbicacionesRuta.php?id_rondin=${rondinId}`);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();

            if (data.success && Array.isArray(data.ubicaciones) && data.ubicaciones.length > 0) {
                // Mapear los datos recibidos a un formato consistente
                ubicacionesData = data.ubicaciones.map(ubicacion => ({
                    id: ubicacion.id_ubicacion.toString(), // Asegúrate de que el ID sea string para comparación con QR
                    nombre: ubicacion.nombre || 'Sin nombre',
                    descripcion: ubicacion.descripcion || 'Sin descripción',
                    latitud: parseFloat(ubicacion.latitud),
                    longitud: parseFloat(ubicacion.longitud),
                    rawData: ubicacion // Guarda los datos originales si necesitas más tarde
                })).filter(ubicacion => {
                    // Filtra ubicaciones con datos incompletos o inválidos
                    return ubicacion.id && !isNaN(ubicacion.latitud) && !isNaN(ubicacion.longitud);
                });
                
                if (ubicacionesData.length === 0) {
                    throw new Error('No se encontraron ubicaciones válidas o completas para este rondín.');
                }
                
                renderUbicaciones(); // Renderiza la lista de ubicaciones
                elements.emptyState.classList.add('d-none'); // Oculta el estado vacío
            } else {
                throw new Error(data.message || 'No se encontraron ubicaciones para este rondín.');
            }
        } catch (error) {
            console.error('Error al cargar las ubicaciones:', error);
            showErrorState('Error al cargar las ubicaciones. Por favor, inténtalo de nuevo. Detalle: ' + error.message);
        }
    }

    function showErrorState(message) {
        elements.emptyState.classList.remove('d-none'); // Muestra el estado vacío/de error
        elements.emptyState.innerHTML = `
            <div class="text-center">
                <i class="bi bi-exclamation-triangle-fill text-danger fs-1"></i>
                <p class="mt-3">${message}</p>
                <button class="btn btn-primary mt-2" onclick="location.reload()">
                    <i class="bi bi-arrow-repeat"></i> Intentar nuevamente
                </button>
            </div>
        `;
        elements.ubicacionesList.innerHTML = ''; // Limpia la lista de ubicaciones
    }

    function renderUbicaciones() {
        elements.ubicacionesList.innerHTML = ''; // Limpia la lista antes de renderizar
        if (ubicacionesData.length === 0) {
            elements.emptyState.classList.remove('d-none');
            return;
        }

        ubicacionesData.forEach((ubicacion, index) => {
            const item = document.createElement('div');
            item.className = 'list-group-item list-group-item-action';
            
            // Lógica para determinar si la ubicación está habilitada o escaneada
            const isEnabled = index === 0 || 
                             (index > 0 && ubicacionesEscaneadas.includes(ubicacionesData[index - 1].id));
            const isScanned = ubicacionesEscaneadas.includes(ubicacion.id);
            
            item.innerHTML = `
                <div class="d-flex w-100 justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <span class="badge me-3 ${isScanned ? 'bg-success' : 'bg-primary'}">${index + 1}</span>
                        <div>
                            <h5 class="mb-1 ${isScanned ? 'text-success' : ''}">
                                ${ubicacion.nombre}
                                ${isScanned ? '<i class="bi bi-check-circle-fill ms-2"></i>' : ''}
                            </h5>
                            <small class="text-muted">${ubicacion.descripcion}</small>
                        </div>
                    </div>
                    ${isEnabled && !isScanned ? '<i class="bi bi-qr-code fs-4"></i>' : (isScanned ? '<i class="bi bi-check-circle-fill text-success fs-4"></i>' : '<i class="bi bi-lock-fill text-muted"></i>')}
                </div>
            `;
            
            // Añadir clases para estilos de deshabilitado o escaneado
            if (!isEnabled) {
                item.classList.add('disabled');
            } else if (isScanned) {
                item.classList.add('bg-light'); // Estilo para ubicaciones ya escaneadas
            }

            elements.ubicacionesList.appendChild(item);
        });
    }

    function showScannerError(message) {
        // Mapeo de mensajes de error técnicos a mensajes amigables para el usuario
        const userFriendlyMessages = {
            'No se detectaron cámaras disponibles': 'No se encontró una cámara disponible en tu dispositivo.',
            'Permission denied': 'Necesitamos permiso para acceder a tu cámara. Por favor, actívala en la configuración de tu navegador.',
            'Requested device not found': 'No se pudo acceder a la cámara. Asegúrate de que no esté en uso por otra aplicación.',
            'El QR escaneado no coincide con esta ubicación': 'El código QR escaneado no es el de esta ubicación. ¡Asegúrate de escanear el correcto!',
            'Estás a': 'Estás demasiado lejos de la ubicación. Por favor, acércate para poder escanear el QR.',
            'QR code parse error, error = R no Multiformat': 'No se pudo leer el código QR. Intenta enfocarlo mejor o busca un código más claro.',
            'QR code parse error': 'Manten enfocado el código QR. Hay un problema para leerlo.',
            'NotFoundException': '' // Este es un error interno común de la librería, no lo mostramos al usuario
        };

        let friendlyMessage = message;
        for (const [key, value] of Object.entries(userFriendlyMessages)) {
            if (message.includes(key)) {
                friendlyMessage = value;
                break;
            }
        }

        if (!friendlyMessage) return; // Si el mensaje está vacío, no mostramos nada

        elements.scannerError.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi bi-exclamation-triangle-fill me-2" style="color:rgb(7, 106, 255);"></i>
                <span>${friendlyMessage}</span>
            </div>
        `;
        elements.scannerError.className = 'alert alert-info mt-3'; // Usar alert-info para mensajes no críticos
        elements.scannerError.classList.remove('d-none');
    }

    async function iniciarEscaneoQR(ubicacionExpected) {
        // Validar que la ubicación tenga los datos necesarios para la geolocalización
        if (!ubicacionExpected?.id || isNaN(ubicacionExpected.latitud) || isNaN(ubicacionExpected.longitud)) {
            showScannerError('Datos de ubicación inválidos. No se puede iniciar el escáner.');
            return;
        }

        elements.scannerError.classList.add('d-none'); // Ocultar errores previos
        elements.qrScannerModal.show(); // Mostrar el modal

        try {
            // Detener el escáner si ya está corriendo para reiniciarlo
            if (html5QrCode?.isScanning) {
                await html5QrCode.stop();
            }
            elements.qrScannerContainer.innerHTML = ''; // Limpiar cualquier residuo de la cámara anterior

            // Inicializar el objeto Html5Qrcode
            html5QrCode = new Html5Qrcode("qr-scanner-container", {
                formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE], // Solo códigos QR
                experimentalFeatures: {
                    useBarCodeDetectorIfSupported: true // Puede mejorar el rendimiento en algunos dispositivos
                },
                verbose: false // No mostrar mensajes de depuración en consola
            });

            const cameras = await Html5Qrcode.getCameras();
            if (cameras.length === 0) {
                throw new Error('No se detectaron cámaras disponibles.');
            }

            // Seleccionar cámara trasera por defecto si está disponible, si no, la primera
            currentCameraId = cameras.find(cam => cam.label.toLowerCase().includes('back'))?.id || cameras[0].id;
            
            // Mostrar botón de cambiar cámara solo si hay más de una cámara
            elements.switchCameraBtn.classList.toggle('d-none', cameras.length <= 1);

            await html5QrCode.start(
                currentCameraId,
                {
                    fps: 10, // Frames por segundo del escáner
                    qrbox: { width: 250, height: 250 }, // Tamaño del recuadro de escaneo
                    aspectRatio: 1.0, // Mantiene el aspecto cuadrado del video
                    disableFlip: true // Deshabilita la inversión de la imagen (útil para cámaras frontales)
                },
                qrCodeData => verificarQR(qrCodeData, ubicacionExpected), // Callback cuando se detecta un QR
                errorMessage => {
                    // Ignorar errores 'NotFoundException' que son comunes cuando no hay QR en la vista
                    if (!errorMessage.includes('NotFoundException')) {
                        showScannerError(errorMessage);
                    }
                }
            ).then(() => {
                // Ajustes adicionales después de que la cámara inicia
                const canvas = document.querySelector("#qr-scanner-container canvas");
                if (canvas) {
                    // Configurar el contexto del canvas para un mejor rendimiento de lectura
                    const ctx = canvas.getContext('2d', { willReadFrequently: true });
                }
                
                // Verificar si la cámara soporta flash y mostrar el botón
                if (html5QrCode.getRunningTrackCapabilities()?.torch) {
                    elements.torchBtn.classList.remove('d-none');
                } else {
                    elements.torchBtn.classList.add('d-none');
                }
            });

        } catch (error) {
            console.error('Error al iniciar el escáner QR:', error);
            showScannerError(error.message); // Mostrar el error al usuario
            if (html5QrCode?.isScanning) {
                await html5QrCode.stop(); // Asegurarse de detener el escáner si hubo un error al iniciar
            }
        }
    }

    async function switchCamera() {
        try {
            const cameras = await Html5Qrcode.getCameras();
            if (cameras.length <= 1) return; // No hay más cámaras para cambiar

            const currentIndex = cameras.findIndex(cam => cam.id === currentCameraId);
            const nextIndex = (currentIndex + 1) % cameras.length;
            currentCameraId = cameras[nextIndex].id;

            await html5QrCode.stop(); // Detener la cámara actual
            await html5QrCode.start(
                currentCameraId,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                qrCodeData => verificarQR(qrCodeData, ubicacionExpected), // El callback de éxito se mantiene
                errorMessage => {
                    if (!errorMessage.includes('NotFoundException')) {
                        showScannerError(errorMessage);
                    }
                }
            ).then(() => {
                // Actualizar el estado del botón de flash para la nueva cámara
                if (html5QrCode.getRunningTrackCapabilities()?.torch) {
                    elements.torchBtn.classList.remove('d-none');
                } else {
                    elements.torchBtn.classList.add('d-none');
                }
            });
        } catch (error) {
            console.error('Error al cambiar de cámara:', error);
            showScannerError('Error al cambiar de cámara. Por favor, intenta de nuevo.');
        }
    }

    async function toggleTorch() {
        try {
            const torchBtn = elements.torchBtn;
            const isTorchOn = torchBtn.classList.contains('active'); // Verifica si el flash está encendido

            if (isTorchOn) {
                await html5QrCode.turnOffFlash();
                torchBtn.classList.remove('active');
                torchBtn.innerHTML = '<i class="bi bi-lightbulb"></i> Flash';
            } else {
                await html5QrCode.turnOnFlash();
                torchBtn.classList.add('active');
                torchBtn.innerHTML = '<i class="bi bi-lightbulb-fill"></i> Flash';
            }
        } catch (error) {
            console.error('Error al controlar el flash:', error);
            showScannerError('No se pudo controlar el flash de la cámara.');
        }
    }

    async function verificarQR(qrData, ubicacionExpected) {
        try {
            const qrId = qrData.trim();
            // 1. Verificar que el QR escaneado coincida con la ubicación esperada
            if (qrId !== ubicacionExpected.id) {
                throw new Error('El QR escaneado no coincide con esta ubicación.');
            }

            // 2. Obtener la geolocalización actual del usuario
            const posicion = await obtenerGeolocalizacion();
            const distancia = calcularDistancia(
                posicion.coords.latitude,
                posicion.coords.longitude,
                ubicacionExpected.latitud,
                ubicacionExpected.longitud
            );

            // 3. Verificar si la distancia está dentro del límite permitido
            if (distancia > DISTANCIA_MAXIMA_METROS) {
                throw new Error(`Estás a ${Math.round(distancia)}m de la ubicación (máximo permitido: ${DISTANCIA_MAXIMA_METROS}m).`);
            }

            // Si todas las verificaciones pasan:
            // Marcar la ubicación como escaneada (si no lo está ya) y guardar en localStorage
            if (!ubicacionesEscaneadas.includes(ubicacionExpected.id)) {
                ubicacionesEscaneadas.push(ubicacionExpected.id);
                localStorage.setItem(`rondin_${rondinId}_escaneadas`, JSON.stringify(ubicacionesEscaneadas));
                // Volver a renderizar la lista para que la ubicación aparezca como escaneada
                renderUbicaciones(); 
            }

            // Detener el escáner y cerrar el modal
            await html5QrCode.stop();
            elements.qrScannerModal.hide();
            
            // Redirigir al formulario de reporte con los IDs necesarios
            window.location.href = `/Centinela/pages/formReporte.php?id_ubicacion=${ubicacionExpected.id}&id_rondin=${rondinId}`;

        } catch (error) {
            // Mostrar cualquier error que ocurra durante la verificación (QR incorrecto, lejos, etc.)
            showScannerError(error.message);
        }
    }

    function obtenerGeolocalizacion() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Tu dispositivo no soporta geolocalización.'));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                position => resolve(position),
                error => {
                    let message = 'No se pudo obtener tu ubicación.';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            message = 'Por favor, activa los permisos de ubicación para esta aplicación.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            message = 'Tu ubicación no está disponible. Intenta en un lugar con mejor señal GPS.';
                            break;
                        case error.TIMEOUT:
                            message = 'Tiempo de espera agotado al intentar obtener tu ubicación. Asegúrate de tener buena conexión.';
                            break;
                        default:
                            message += ` (Error code: ${error.code})`;
                    }
                    reject(new Error(message));
                },
                { 
                    enableHighAccuracy: true, // Solicitar la máxima precisión posible
                    timeout: 10000, // Tiempo máximo para obtener la ubicación (10 segundos)
                    maximumAge: 0 // No usar una posición en caché, solicitar una nueva
                }
            );
        });
    }

    // Función para calcular la distancia entre dos puntos geográficos (fórmula de Haversine)
    function calcularDistancia(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Radio de la Tierra en metros
        const φ1 = lat1 * Math.PI/180; // lat1 en radianes
        const φ2 = lat2 * Math.PI/180; // lat2 en radianes
        const Δφ = (lat2 - lat1) * Math.PI/180; // diferencia de latitud en radianes
        const Δλ = (lon2 - lon1) * Math.PI/180; // diferencia de longitud en radianes

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c; // Distancia en metros
    }

    function cargarUbicacionesEscaneadas() {
        try {
            // Cargar ubicaciones escaneadas desde localStorage para el rondín actual
            const escaneadas = localStorage.getItem(`rondin_${rondinId}_escaneadas`);
            if (escaneadas) {
                ubicacionesEscaneadas = JSON.parse(escaneadas);
                // Asegurarse de que el valor parseado sea un array
                if (!Array.isArray(ubicacionesEscaneadas)) {
                    ubicacionesEscaneadas = [];
                }
            }
        } catch (e) {
            console.error('Error al cargar ubicaciones escaneadas de localStorage:', e);
            ubicacionesEscaneadas = []; // En caso de error de parseo, reiniciar el array
        }
    }
});