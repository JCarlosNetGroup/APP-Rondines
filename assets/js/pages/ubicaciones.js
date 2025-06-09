document.addEventListener('DOMContentLoaded', init);

//* Función de entrada principal, se ejecuta al cargar el DOM
function init() {
    try {
        fetchTableLocations();
        formAddLocation();
        formEditLocation();
        setupSearchAndFilter();
    } catch (error) {
        console.error('Error en inicialización:', error);
        showErrorAlert();
    }
}



//* Configuración de los controles de búsqueda y filtro
function setupSearchAndFilter() {
    const inputBusqueda = document.getElementById('inputBusqueda');
    const selectEstado = document.getElementById('selectEstado');
    
    // Evento para el input de búsqueda con debounce
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', debounce(function (e) {
            const estado = selectEstado ? selectEstado.value : '';
            fetchTableLocations(e.target.value, estado);
        }, 300));
    }
    
    // Evento para el select de estado
    if (selectEstado) {
        selectEstado.addEventListener('change', function (e) {
            const searchTerm = inputBusqueda ? inputBusqueda.value : '';
            fetchTableLocations(searchTerm, e.target.value);
        });
    }
}



//* Función debounce para limitar la frecuencia de ejecución
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}



//* Función que obtiene los registros del servidor con filtros
function fetchTableLocations(searchTerm = '', estado = '') {
    let url = `../controller/tableLocation.php`;
    const params = new URLSearchParams();

    // Añade parámetros de búsqueda y filtro
    if (searchTerm) params.append('search', searchTerm);
    if (estado) params.append('estado', estado);
    
    if (params.toString()) url += `?${params.toString()}`;

    // Realiza la petición fetch al servidor
    fetch(url)
        .then((response) => response.json())
        .then((response) => {
            const tableBody = document.querySelector("#data-table tbody");
            const fragment = document.createDocumentFragment();

            // Procesa cada fila de datos recibidos
            response.data.forEach((row) => {
                const tr = document.createElement("tr");
                
                // Función para crear celdas
                const createCell = (value) => {
                    const td = document.createElement("td");
                    td.textContent = value;
                    return td;
                };

                // Añade celdas con los datos de la ubicación
                tr.appendChild(createCell(row.id_ubicacion));
                tr.appendChild(createCell(row.nombre));
                tr.appendChild(createCell(row.latitud));
                tr.appendChild(createCell(row.longitud));
                
                // Celda de estado con clase CSS según el estado
                const estadoCell = document.createElement("td");
                estadoCell.textContent = row.estado;
                estadoCell.className = `estado-${row.estado.toLowerCase()}`;
                tr.appendChild(estadoCell);

                // Celda de acciones con botón de edición
                const actionsTd = document.createElement("td");
                const editLink = document.createElement("a");
                editLink.className = "edit";
                editLink.setAttribute("data-bs-toggle", "modal");
                editLink.setAttribute("data-bs-target", "#editLocation");

                // Almacena todos los datos de la ubicación como atributos para el modal de edición
                editLink.setAttribute("data-ubicacion-id", row.id_ubicacion);
                editLink.setAttribute("data-ubicacion-nombre", row.nombre);
                editLink.setAttribute("data-ubicacion-descripcion", row.descripcion);
                editLink.setAttribute("data-ubicacion-latitud", row.latitud);
                editLink.setAttribute("data-ubicacion-longitud", row.longitud);
                editLink.setAttribute("data-ubicacion-estado", row.estado);
                editLink.setAttribute("data-ubicacion-qrpath", row.qr_path || '');

                // Añade icono de edición
                const icon = document.createElement("i");
                icon.className = "bi bi-pencil-square";
                editLink.appendChild(icon);
                actionsTd.appendChild(editLink);
                tr.appendChild(actionsTd);
                fragment.appendChild(tr);
            });

            // Limpia la tabla y añade las nuevas filas
            tableBody.innerHTML = "";
            tableBody.appendChild(fragment);
        })
        .catch((error) => {
            console.error("Error al obtener los datos:", error);
            showError("Error al cargar los datos de ubicaciones");
        });
}



//* Función para agregar nueva ubicación
function formAddLocation() {
    const form = document.querySelector("#formAddLocation");
    const modal = document.getElementById('modalAddLocation');

    if (form && modal) {
        const bsModal = new bootstrap.Modal(modal);

        // Resetea el formulario cada vez que se abre el modal
        modal.addEventListener('show.bs.modal', () => {
            form.reset();
        });

        // Maneja el envío del formulario
        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true; // Deshabilita el botón para evitar múltiples envíos

            try {
                const formData = new FormData(this);
                
                // Envía los datos al servidor
                const response = await fetch('../controller/addLocation.php', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();

                if (!data.success) throw new Error(data.message || 'Error al agregar la ubicación');

                // Prepara datos para generar el QR (solo se necesita el ID ahora)
                const qrData = {
                    id: data.id, // El ID de la ubicación recién creada
                    // nombre, latitud, longitud ya no son necesarios para el contenido del QR
                };

                // Genera y guarda el QR
                const qrImageUrl = await generateQR(qrData);
                const qrResult = await saveQR(data.id, qrImageUrl);
                if (!qrResult.success) throw new Error(qrResult.message);

                // Muestra éxito, cierra modal y actualiza tabla
                await showSuccess('Ubicación guardada correctamente');
                bsModal.hide();
                form.reset();
                fetchTableLocations();

            } catch (error) {
                await showError(error.message || 'Error en el proceso');
            } finally {
                submitBtn.disabled = false; // Rehabilita el botón
            }
        });
    }
}



//* Función para editar ubicación
function formEditLocation() {
    const modal = document.getElementById('editLocation');
    const form = document.getElementById('formEditLocation');

    if (modal && form) {
        const bsModal = new bootstrap.Modal(modal);

        // Configura el modal cuando se va a mostrar
        modal.addEventListener('show.bs.modal', function(event) {
            const button = event.relatedTarget;
            if (!button) return;

            // Obtiene los datos de la ubicación desde los atributos del botón
            const id = button.getAttribute('data-ubicacion-id');
            const nombre = button.getAttribute('data-ubicacion-nombre');
            const descripcion = button.getAttribute('data-ubicacion-descripcion');
            const latitud = button.getAttribute('data-ubicacion-latitud');
            const longitud = button.getAttribute('data-ubicacion-longitud');
            const estado = button.getAttribute('data-ubicacion-estado');
            const qrPath = button.getAttribute('data-ubicacion-qrpath') || '';

            // Rellena los campos del formulario con los datos
            document.getElementById('edit-id').value = id || '';
            document.getElementById('edit-nombre').value = nombre || '';
            document.getElementById('edit-descripcion').value = descripcion || '';
            document.getElementById('edit-latitud').value = latitud || '';
            document.getElementById('edit-longitud').value = longitud || '';
            document.getElementById('edit-estado').value = estado || '';

            // Muestra la vista previa del QR si existe
            const qrPreview = document.getElementById('qrPreview');
            if (qrPath) {
                const fullQrPath = qrPath.startsWith('http') ? qrPath : 
                                     `${window.location.origin}${qrPath.startsWith('/') ? '' : '/'}${qrPath}`;
                
                const img = document.createElement('img');
                img.src = fullQrPath;
                img.className = 'img-fluid';
                img.style.maxWidth = '100%';
                img.alt = `Código QR para ${nombre}`;
                
                img.onload = function() {
                    qrPreview.innerHTML = '';
                    qrPreview.appendChild(img);
                };
                
                img.onerror = function() {
                    qrPreview.innerHTML = `
                        <div class="alert alert-warning">
                            <p>No se pudo cargar el código QR</p>
                            <small>Ruta: ${fullQrPath}</small>
                        </div>
                    `;
                };
                
                qrPreview.innerHTML = '<p>Cargando QR...</p>';
                qrPreview.appendChild(img);
            } else {
                qrPreview.innerHTML = '<p class="text-muted">No hay QR generado para esta ubicación</p>';
            }
        });

        // Maneja el envío del formulario de edición
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;

            try {
                const formData = new FormData(form);
                const id = formData.get('id');

                // Validación básica de campos requeridos
                if (!id || !formData.get('nombre') || !formData.get('latitud') || !formData.get('longitud')) {
                    throw new Error('Todos los campos son requeridos');
                }

                // Envía los datos al servidor
                const response = await fetch('/centinela/controller/editLocation.php', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.message || 'Error al actualizar la ubicación');
                }

                // Muestra mensaje de éxito y actualiza la tabla
                await Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Ubicación actualizada correctamente',
                    confirmButtonColor: '#283747',
                    timer: 2000
                });

                bsModal.hide();
                fetchTableLocations();

            } catch (error) {
                console.error('Error al editar ubicación:', error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Error al actualizar la ubicación',
                    confirmButtonColor: '#d33'
                });
            } finally {
                submitBtn.disabled = false;
            }
        });

        // Maneja la descarga del QR
        document.getElementById('downloadQR')?.addEventListener('click', function() {
            const qrImg = document.querySelector('#qrPreview img');
            if (qrImg) {
                // Crea un enlace temporal para descargar la imagen
                const link = document.createElement('a');
                link.href = qrImg.src;
                link.download = `qr_ubicacion_${document.getElementById('edit-id').value}.png`;
                link.click();
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'No hay QR para descargar',
                    text: 'Esta ubicación no tiene un código QR generado',
                    confirmButtonColor: '#283747'
                });
            }
        });
    }
}



//* Funciones auxiliares

// Muestra una alerta de error con opción para recargar la página
function showErrorAlert() {
    Swal.fire({
        title: 'Error',
        text: "Hubo un problema al cargar los datos.",
        icon: 'error',
        confirmButtonText: 'Recargar',
        allowOutsideClick: false,
    }).then((result) => {
        if (result.isConfirmed) {
            location.reload();
        }
    });
}

// Genera un código QR a partir de los datos proporcionados
// **MODIFICACIÓN CLAVE AQUÍ: EL QR AHORA SOLO CONTIENE EL ID DE LA UBICACIÓN**
async function generateQR(data) {
    return new Promise((resolve, reject) => {
        // Se asegura de que 'data' contenga un 'id' válido
        if (!data || data.id === undefined || data.id === null) {
            reject(new Error('ID de ubicación no proporcionado para generar QR.'));
            return;
        }

        // Se codifica solo el ID de la ubicación en el QR
        QRCode.toDataURL(data.id.toString(), {
            width: 300,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' }
        }, (err, url) => {
            if (err) reject(new Error('Error al generar QR'));
            else resolve(url);
        });
    });
}

// Guarda el QR en el servidor
async function saveQR(id, imageData) {
    const response = await fetch('../controller/saveQR.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId: id, imageData })
    });
    return await response.json();
}

// Muestra un mensaje de éxito
function showSuccess(message) {
    return Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: message,
        confirmButtonColor: '#283747',
        timer: 2000
    });
}

// Muestra un mensaje de error
function showError(message) {
    return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonColor: '#d33'
    });
}