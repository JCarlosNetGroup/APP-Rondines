// =============================================
// * CONSTANTES Y CONFIGURACIONES
// =============================================
const MAP_CONFIG = {
    center: [20.598292647819406, -100.45967435981838],
    zoom: 18,
    markerPosition: [20.59865, -100.45836],
    markerPopup: 'NETWORKS'
};

const API_ENDPOINTS = {
    rutas: 'centinela/controller/getRutas.php',
    addRuta: '../controller/addRuta.php',
    updateRuta: '../controller/updateRutas.php',
    ubicaciones: '../controller/locationsActive.php',
    ubicacionesRuta: '../controller/getUbicacionesRuta.php'
};

// =============================================
// * FUNCIONES UTILITARIAS
// =============================================
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

// =============================================
// * MÓDULO DEL MAPA
// =============================================
const MapModule = (() => {
    let map;
    let currentMarkers = [];
    let currentRoute = null;

    const init = () => {
        map = L.map('map').setView(MAP_CONFIG.center, MAP_CONFIG.zoom);

        L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}', {
            minZoom: 0,
            maxZoom: 18,
            attribution: '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            ext: 'jpg'
        }).addTo(map);
    };

    const clearMarkers = () => {
        currentMarkers.forEach(marker => map.removeLayer(marker));
        currentMarkers = [];
        if (currentRoute) {
            map.removeLayer(currentRoute);
            currentRoute = null;
        }
    };

    const drawRoute = (ubicaciones) => {
        clearMarkers();

        // Ordenar ubicaciones por el orden de la ruta
        const ubicacionesOrdenadas = [...ubicaciones].sort((a, b) => a.orden - b.orden);

        // Crear polilínea
        const points = ubicacionesOrdenadas.map(u => [u.latitud, u.longitud]);
        currentRoute = L.polyline(points, { color: '#3388ff'}).addTo(map);

        // Añadir marcadores
        ubicacionesOrdenadas.forEach((ubicacion, index) => {
            const marker = L.marker([ubicacion.latitud, ubicacion.longitud])
                .bindPopup(`
                    <b>${index + 1}. ${ubicacion.nombre}</b><br>
                    ${ubicacion.descripcion || ''}
                `)
                .addTo(map);
            currentMarkers.push(marker);
        });

        // Ajustar vista al área de la ruta
        if (points.length > 0) {
            map.fitBounds(points);
        }
    };

    return { init, drawRoute, clearMarkers };
})();

// =============================================
// * MÓDULO DE NOTIFICACIONES
// =============================================
const NotificationModule = (() => {
    const showSuccess = (message) => {
        Swal.fire({
            title: 'Éxito',
            text: message,
            icon: 'success',
            confirmButtonText: 'Aceptar',
            timer: 3000,
            timerProgressBar: true,
            toast: true,
            position: 'top-end'
        });
    };

    const showError = (message) => {
        Swal.fire({
            title: 'Error',
            text: message,
            icon: 'error',
            confirmButtonText: 'Aceptar',
            timer: 5000,
            timerProgressBar: true
        });
    };

    return { showSuccess, showError };
})();

// =============================================
// * MÓDULO DE UTILIDADES
// =============================================
const UtilsModule = (() => {
    const getEstadoBadgeClass = (estado) => {
        const estadoLower = estado.toLowerCase();
        if (estadoLower.includes('activa')) return 'bg-success';
        if (estadoLower.includes('suspendida')) return 'bg-secondary';
        if (estadoLower.includes('bloqueada')) return 'bg-danger';
        return 'bg-primary';
    };

    const formatTime = (timestamp) => {
        return timestamp ? timestamp.split(' ')[1].substring(0, 5) : '--:--';
    };

    return { getEstadoBadgeClass, formatTime };
})();

// =============================================
// * MÓDULO DE RUTAS
// =============================================
const RutasModule = (() => {
    let selectedUbicacionesOrderEdit = [];
    let rutasData = [];

    const fetchTableRutas = async (searchTerm = '', estado = undefined) => {
        try {
            const url = new URL(API_ENDPOINTS.rutas, window.location.origin);
            if (searchTerm) url.searchParams.append('search', searchTerm);
            if (estado !== undefined) url.searchParams.append('estado', estado);

            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

            const data = await response.json();
            rutasData = data.rutas || [];
            renderRutasTable(data);
        } catch (error) {
            console.error("Error al obtener las rutas:", error);
            NotificationModule.showError('Error al cargar las rutas: ' + error.message);
        }
    };

    const renderRutasTable = (data) => {
        const tableBody = document.querySelector("#data-table tbody");
        const fragment = document.createDocumentFragment();

        if (!data.rutas || data.rutas.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center">No hay rutas registradas</td></tr>`;
            return;
        }

        data.rutas.forEach((ruta) => {
            const tr = document.createElement("tr");
            tr.dataset.rutaId = ruta.id_rondin;

            tr.innerHTML = `
                <td>${ruta.id_rondin}</td>
                <td>${ruta.nombre}</td>
                <td>${ruta.hora_inicio || '--:--'}</td>
                <td>${ruta.hora_fin || '--:--'}</td>
                <td>${ruta.estado}</td>
                <td>
                    <a class="edit" data-bs-toggle="modal" data-bs-target="#editRuta"
                       data-ruta-id="${ruta.id_rondin}"
                       data-ruta-nombre="${ruta.nombre}"
                       data-ruta-descripcion="${ruta.descripcion}"
                       data-ruta-hora-inicio="${ruta.hora_inicio}"
                       data-ruta-hora-fin="${ruta.hora_fin}"
                       data-ruta-estado="${ruta.estado}">
                        <i class="bi bi-pencil-square"></i>
                    </a>
                </td>
            `;

            tr.addEventListener('click', () => {
                document.querySelectorAll("#data-table tbody tr").forEach(row => {
                    row.classList.remove('table-active');
                });
                tr.classList.add('table-active');
                showRouteOnMap(ruta.id_rondin);
            });

            fragment.appendChild(tr);
        });

        tableBody.innerHTML = "";
        tableBody.appendChild(fragment);
    };

    const showRouteOnMap = async (rutaId) => {
        try {
            const ruta = rutasData.find(r => r.id_rondin == rutaId);
            const mapHeaderTitle = document.querySelector('.map-header h5');

            if (ruta && Array.isArray(ruta.ubicaciones)) {
                if (ruta.ubicaciones.length > 0) {
                    MapModule.drawRoute(ruta.ubicaciones);
                    if (mapHeaderTitle) {
                        mapHeaderTitle.textContent = `NETWORKS - Ruta: ${ruta.nombre}`;
                    }
                } else {
                    NotificationModule.showError('Esta ruta no tiene ubicaciones asignadas.');
                    MapModule.clearMarkers();
                    if (mapHeaderTitle) {
                        mapHeaderTitle.textContent = 'NETWORKS';
                    }
                }
            } else {
                NotificationModule.showError('No se pudieron cargar las ubicaciones para esta ruta.');
                MapModule.clearMarkers();
                if (mapHeaderTitle) {
                    mapHeaderTitle.textContent = 'NETWORKS';
                }
            }
        } catch (error) {
            console.error("Error al mostrar ruta:", error);
            NotificationModule.showError('Error al cargar la ruta en el mapa: ' + error.message);
            MapModule.clearMarkers();
            const mapHeaderTitle = document.querySelector('.map-header h5');
            if (mapHeaderTitle) {
                mapHeaderTitle.textContent = 'NETWORKS';
            }
        }
    };

    return { fetchTableRutas };
})();

// =============================================
// * MÓDULO DE FORMULARIO DE AÑADIR RUTA
// =============================================
const AddRutaFormModule = (() => {
    let currentOrder = 1;
    let selectedUbicaciones = []; // Array para rastrear ubicaciones seleccionadas y su orden

    const init = () => {
        const form = document.querySelector("#formAddRuta");
        const modal = document.getElementById('addRuta');

        if (!form || !modal) return;

        const bsModal = new bootstrap.Modal(modal);

        modal.addEventListener('show.bs.modal', handleModalShow);
        document.getElementById('searchUbicaciones')?.addEventListener('input', handleSearchUbicaciones);
        form.addEventListener("submit", handleFormSubmit);
    };

    const handleModalShow = async () => {
        document.querySelector("#formAddRuta").reset();
        document.getElementById('inicioRuta').value = '08:00';
        document.getElementById('finRuta').value = '17:00';
        currentOrder = 1;
        selectedUbicaciones = []; // Reiniciar el array al mostrar el modal
        await cargarUbicaciones();
    };

    const handleSearchUbicaciones = function () {
        const searchTerm = this.value.toLowerCase();
        document.querySelectorAll('#ubicaciones-list tr').forEach(row => {
            const nombre = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
            row.style.display = nombre.includes(searchTerm) ? '' : 'none';
        });
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        try {
            const formData = new FormData(form);
            await validateFormData(formData);

            const response = await fetch(API_ENDPOINTS.addRuta, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.message || 'Error al agregar la ruta');

            await NotificationModule.showSuccess('Ruta guardada correctamente');
            bootstrap.Modal.getInstance(form.closest('.modal')).hide();
            RutasModule.fetchTableRutas();
        } catch (error) {
            await NotificationModule.showError(error.message);
        } finally {
            submitBtn.disabled = false;
        }
    };

    const validateFormData = (formData) => {
        const horaInicio = formData.get('hora_inicio');
        const horaFin = formData.get('fin');

        if (horaInicio >= horaFin) {
            throw new Error('La hora de fin debe ser posterior a la hora de inicio');
        }

        const ubicacionesOrdenadas = getSelectedUbicaciones();
        if (ubicacionesOrdenadas.length === 0) {
            throw new Error('Debe seleccionar al menos una ubicación');
        }

        formData.append('ubicaciones', JSON.stringify(ubicacionesOrdenadas));
    };

    const getSelectedUbicaciones = () => {
        return [...selectedUbicaciones].sort((a, b) => a.orden - b.orden);
    };

    const cargarUbicaciones = async () => {
        const ubicacionesList = document.getElementById('ubicaciones-list');
        ubicacionesList.innerHTML = '';

        try {
            const response = await fetch(API_ENDPOINTS.ubicaciones);
            const result = await response.json();

            if (!result.data || result.data.length === 0) {
                showNoUbicacionesMessage(ubicacionesList, result.message);
                return;
            }

            result.data.forEach(ubicacion => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="row-check">
                        <input type="checkbox" class="form-check-input form-check-lg ubicacion-check" 
                               value="${ubicacion.id}" data-nombre="${ubicacion.nombre}">
                        <span class="orden-seleccion d-none"></span>
                    </td>
                    <td>${ubicacion.nombre}</td>
                    <td><span class="badge ${UtilsModule.getEstadoBadgeClass(ubicacion.estado)}">
                        ${ubicacion.estado}
                    </span></td>
                `;
                ubicacionesList.appendChild(row);
            });

            setupCheckboxListeners();
        } catch (error) {
            showUbicacionesError(ubicacionesList, error);
        }
    };

    const setupCheckboxListeners = () => {
        document.querySelectorAll('.ubicacion-check').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const ubicacionId = parseInt(this.value);
                const ordenSpan = this.nextElementSibling;

                if (this.checked) {
                    // Agregar al array de seleccionados con el orden actual
                    selectedUbicaciones.push({
                        id: ubicacionId,
                        orden: currentOrder++
                    });
                    ordenSpan.textContent = selectedUbicaciones.find(u => u.id === ubicacionId).orden;
                    ordenSpan.classList.remove('d-none');
                } else {
                    // Eliminar del array de seleccionados
                    selectedUbicaciones = selectedUbicaciones.filter(u => u.id !== ubicacionId);
                    ordenSpan.textContent = '';
                    ordenSpan.classList.add('d-none');
                    reordenarSeleccionados();
                }
            });
        });
    };

    const reordenarSeleccionados = () => {
        // Ordenar las ubicaciones por su orden actual
        selectedUbicaciones.sort((a, b) => a.orden - b.orden);

        // Reasignar órdenes secuenciales manteniendo la posición relativa
        selectedUbicaciones.forEach((ubicacion, index) => {
            ubicacion.orden = index + 1;
            const checkbox = document.querySelector(`.ubicacion-check[value="${ubicacion.id}"]`);
            if (checkbox) {
                checkbox.nextElementSibling.textContent = ubicacion.orden;
            }
        });

        currentOrder = selectedUbicaciones.length + 1;
    };

    const showNoUbicacionesMessage = (container, message) => {
        container.innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-muted py-3">
                    ${message || 'No hay ubicaciones activas disponibles'}
                </td>
            </tr>`;
    };

    const showUbicacionesError = (container, error) => {
        console.error('Error al cargar ubicaciones:', error);
        container.innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-danger py-3">
                    Error al cargar ubicaciones. Intente nuevamente.
                </td>
            </tr>`;
    };

    return { init };
})();

// =============================================
// * MÓDULO DE FORMULARIO DE EDITAR RUTA
// =============================================
const EditRutaFormModule = (() => {
    let selectedUbicacionesOrderEdit = [];

    const init = () => {
        const modal = document.getElementById('editRuta');
        const form = document.getElementById('formEditRuta');

        if (!modal || !form) return;

        const bsModal = new bootstrap.Modal(modal);

        modal.addEventListener('show.bs.modal', handleModalShow);
        document.getElementById('searchEditUbicaciones')?.addEventListener('input', handleSearchUbicaciones);
        form.addEventListener("submit", handleFormSubmit);
    };

    const handleModalShow = async (event) => {
        const button = event.relatedTarget;
        if (!button) return;

        const rutaData = getRutaDataFromButton(button);
        populateFormFields(rutaData);

        await cargarUbicacionesRuta(rutaData.id);
    };

    const getRutaDataFromButton = (button) => {
        return {
            id: button.getAttribute('data-ruta-id'),
            nombre: button.getAttribute('data-ruta-nombre'),
            descripcion: button.getAttribute('data-ruta-descripcion'),
            horaInicio: button.getAttribute('data-ruta-hora-inicio'),
            horaFin: button.getAttribute('data-ruta-hora-fin'),
            estado: button.getAttribute('data-ruta-estado')
        };
    };

    const populateFormFields = (rutaData) => {
        document.getElementById('edit_idRuta').value = rutaData.id || '';
        document.getElementById('edit_nombreRuta').value = rutaData.nombre || '';
        document.getElementById('edit_descripcionRuta').value = rutaData.descripcion || '';
        document.getElementById('edit_inicioRuta').value = rutaData.horaInicio || '08:00';
        document.getElementById('edit_finRuta').value = rutaData.horaFin || '17:00';

        const estadoSelect = document.getElementById('edit_estadoRuta');
        if (rutaData.estado) {
            const normalizedEstado = rutaData.estado.trim().toLowerCase();
            for (let option of estadoSelect.options) {
                if (option.value.toLowerCase() === normalizedEstado) {
                    option.selected = true;
                    break;
                }
            }
        }
    };

    const handleSearchUbicaciones = function () {
        const searchTerm = this.value.toLowerCase();
        document.querySelectorAll('#edit_ubicaciones-list tr').forEach(row => {
            const nombre = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
            row.style.display = nombre.includes(searchTerm) ? '' : 'none';
        });
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        try {
            const formData = new FormData(form);
            await validateEditFormData(formData);

            const response = await fetch(API_ENDPOINTS.updateRuta, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.message || 'Error al actualizar la ruta');

            NotificationModule.showSuccess('Ruta actualizada correctamente');
            bootstrap.Modal.getInstance(form.closest('.modal')).hide();
            RutasModule.fetchTableRutas();
        } catch (error) {
            NotificationModule.showError(error.message);
        } finally {
            submitBtn.disabled = false;
        }
    };

    const validateEditFormData = (formData) => {
        const id = formData.get('id');
        const horaInicio = formData.get('hora_inicio');
        const horaFin = formData.get('hora_fin');

        if (!id || !formData.get('nombre') || !formData.get('descripcion')) {
            throw new Error('Todos los campos son requeridos');
        }

        if (horaInicio >= horaFin) {
            throw new Error('La hora de fin debe ser posterior a la hora de inicio');
        }

        const ubicacionesOrdenadasParaGuardar = getSelectedUbicacionesForEdit();
        if (ubicacionesOrdenadasParaGuardar.length === 0) {
            throw new Error('Debe seleccionar al menos una ubicación');
        }

        formData.append('ubicaciones', JSON.stringify(ubicacionesOrdenadasParaGuardar));
    };

    const getSelectedUbicacionesForEdit = () => {
        return selectedUbicacionesOrderEdit.map((ubicacionId, index) => ({
            id: ubicacionId,
            orden: index + 1
        }));
    };

    const cargarUbicacionesRuta = async (rutaId) => {
        const ubicacionesList = document.getElementById('edit_ubicaciones-list');
        ubicacionesList.innerHTML = '<tr><td colspan="3" class="text-center py-3">Cargando ubicaciones...</td></tr>';

        try {
            const [allUbicacionesResponse, rutaUbicacionesResponse] = await Promise.all([
                fetch(API_ENDPOINTS.ubicaciones),
                fetch(`${API_ENDPOINTS.ubicacionesRuta}?id_rondin=${rutaId}`)
            ]);

            const allUbicaciones = await allUbicacionesResponse.json();
            const rutaUbicaciones = await rutaUbicacionesResponse.json();

            selectedUbicacionesOrderEdit = rutaUbicaciones.success && Array.isArray(rutaUbicaciones.ubicaciones)
                ? rutaUbicaciones.ubicaciones.map(u => parseInt(u.id_ubicacion)).sort((a, b) => {
                    const orderA = rutaUbicaciones.ubicaciones.find(ub => parseInt(ub.id_ubicacion) === a)?.orden || 0;
                    const orderB = rutaUbicaciones.ubicaciones.find(ub => parseInt(ub.id_ubicacion) === b)?.orden || 0;
                    return orderA - orderB;
                })
                : [];

            if (!allUbicaciones.data || allUbicaciones.data.length === 0) {
                showNoUbicacionesMessage(ubicacionesList, allUbicaciones.message);
                return;
            }

            renderUbicacionesList(ubicacionesList, allUbicaciones.data);
            setupEditCheckboxListeners();
        } catch (error) {
            showUbicacionesError(ubicacionesList, error);
        }
    };

    const renderUbicacionesList = (container, ubicaciones) => {
        container.innerHTML = '';

        ubicaciones.forEach(ubicacion => {
            const isChecked = selectedUbicacionesOrderEdit.includes(parseInt(ubicacion.id));
            const row = document.createElement('tr');

            row.innerHTML = `
                <td class="row-check">
                    <input type="checkbox" class="form-check-input form-check-lg ubicacion-check"
                            value="${ubicacion.id}" ${isChecked ? 'checked' : ''}>
                    <span class="orden-seleccion ${isChecked ? '' : 'd-none'}"></span>
                </td>
                <td>${ubicacion.nombre}</td>
                <td><span class="badge ${UtilsModule.getEstadoBadgeClass(ubicacion.estado)}">
                    ${ubicacion.estado}
                </span></td>
            `;

            container.appendChild(row);
        });
    };

    const setupEditCheckboxListeners = () => {
        document.querySelectorAll('#edit_ubicaciones-list .ubicacion-check').forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                const ubicacionId = parseInt(this.value);

                if (this.checked) {
                    if (!selectedUbicacionesOrderEdit.includes(ubicacionId)) {
                        selectedUbicacionesOrderEdit.push(ubicacionId);
                    }
                } else {
                    selectedUbicacionesOrderEdit = selectedUbicacionesOrderEdit.filter(id => id !== ubicacionId);
                }

                updateUbicacionesOrderUI();
            });
        });

        updateUbicacionesOrderUI();
    };

    const updateUbicacionesOrderUI = () => {
        document.querySelectorAll('#edit_ubicaciones-list .ubicacion-check').forEach(checkbox => {
            const ubicacionId = parseInt(checkbox.value);
            const ordenSpan = checkbox.nextElementSibling;
            const indexInOrder = selectedUbicacionesOrderEdit.indexOf(ubicacionId);

            if (indexInOrder !== -1) {
                ordenSpan.textContent = indexInOrder + 1;
                ordenSpan.classList.remove('d-none');
                checkbox.checked = true;
            } else {
                ordenSpan.textContent = '';
                ordenSpan.classList.add('d-none');
                checkbox.checked = false;
            }
        });
    };

    const showNoUbicacionesMessage = (container, message) => {
        container.innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-muted py-3">
                    ${message || 'No hay ubicaciones activas disponibles'}
                </td>
            </tr>`;
    };

    const showUbicacionesError = (container, error) => {
        console.error('Error al cargar ubicaciones en el modal de edición:', error);
        container.innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-danger py-3">
                    ${error.message || 'Error al cargar ubicaciones. Intente nuevamente.'}
                </td>
            </tr>`;
    };

    return { init };
})();

// =============================================
// * CONFIGURACIÓN DE FILTROS PARA RONDINES
// =============================================
const setupRondinesSearchAndFilter = () => {
    const inputBusqueda = document.getElementById('inputBusquedaRondin');
    const selectEstado = document.getElementById('selectEstadoRondin');
    
    // Primera carga (no envía parámetro estado)
    RutasModule.fetchTableRutas('', undefined);
    
    // Evento para el input de búsqueda con debounce
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', debounce(function (e) {
            const estado = selectEstado ? selectEstado.value : '';
            RutasModule.fetchTableRutas(e.target.value, estado);
        }, 300));
    }
    
    // Evento para el select de estado
    if (selectEstado) {
        selectEstado.addEventListener('change', function (e) {
            const searchTerm = inputBusqueda ? inputBusqueda.value : '';
            RutasModule.fetchTableRutas(searchTerm, e.target.value);
        });
    }
};

// =============================================
// * INICIALIZACIÓN DE LA APLICACIÓN
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    MapModule.init();
    AddRutaFormModule.init();
    EditRutaFormModule.init();
    setupRondinesSearchAndFilter();
});