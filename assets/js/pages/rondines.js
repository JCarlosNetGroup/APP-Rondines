// Inicializar el mapa
function initMap() {
    const map = L.map('map').setView([20.59830, -100.45856], 18);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Aquí puedes agregar marcadores basados en los datos de la tabla

    L.marker([20.59865, -100.45836]).addTo(map)
        .bindPopup('NETWORKS')
        .openPopup();
}

document.addEventListener('DOMContentLoaded', initMap);


//* Función para agregar nueva ruta
function formAddRuta() {
    const form = document.querySelector("#formAddRuta");
    const modal = document.getElementById('addRuta');

    if (form && modal) {
        const bsModal = new bootstrap.Modal(modal);
        let ubicacionesDisponibles = []; // Almacenará las ubicaciones cargadas

        // Resetea el formulario cada vez que se abre el modal
        modal.addEventListener('show.bs.modal', async () => {
            form.reset();
            // Establecer valores por defecto para los horarios
            document.getElementById('inicioRuta').value = '08:00';
            document.getElementById('finRuta').value = '17:00';

            // Cargar ubicaciones disponibles
            await cargarUbicaciones();
        });

        // Buscador de ubicaciones
        document.getElementById('searchUbicaciones')?.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#ubicaciones-list tr');

            rows.forEach(row => {
                const nombre = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                row.style.display = nombre.includes(searchTerm) ? '' : 'none';
            });
        });

        // Maneja el envío del formulario
        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;

            try {
                const formData = new FormData(this);

                // Validar que la hora de fin sea posterior a la de inicio
                const horaInicio = formData.get('inicio');
                const horaFin = formData.get('fin');

                if (horaInicio >= horaFin) {
                    throw new Error('La hora de fin debe ser posterior a la hora de inicio');
                }

                // Obtener ubicaciones seleccionadas con su orden
                const ubicacionesOrdenadas = Array.from(
                    document.querySelectorAll('#ubicaciones-list input[type="checkbox"]:checked')
                ).map(checkbox => {
                    return {
                        id: checkbox.value,
                        nombre: checkbox.dataset.nombre,
                        orden: parseInt(checkbox.nextElementSibling.textContent)
                    };
                });

                if (ubicacionesOrdenadas.length === 0) {
                    throw new Error('Debe seleccionar al menos una ubicación');
                }

                // Ordenar por el número de selección
                ubicacionesOrdenadas.sort((a, b) => a.orden - b.orden);

                // Agregar ubicaciones al formData
                formData.append('ubicaciones', JSON.stringify(ubicacionesOrdenadas));

                // Envía los datos al servidor
                const response = await fetch('../controller/addRuta.php', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();

                if (!data.success) throw new Error(data.message || 'Error al agregar la ruta');

                // Muestra éxito, cierra modal y actualiza tabla
                await showSuccess('Ruta guardada correctamente');
                bsModal.hide();
                form.reset();
                fetchTableRutas();

            } catch (error) {
                await showError(error.message || 'Error en el proceso');
            } finally {
                submitBtn.disabled = false;
            }
        });
    }
}


// Función para cargar ubicaciones disponibles
async function cargarUbicaciones() {
    const ubicacionesList = document.getElementById('ubicaciones-list');
    ubicacionesList.innerHTML = ''; // Limpiar lista antes de cargar

    try {
        const response = await fetch('../controller/locationsActive.php');
        const result = await response.json();

        if (result.data && result.data.length > 0) {
            result.data.forEach(ubicacion => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="row-check">
                        <input type="checkbox" class="form-check-input form-check-lg ubicacion-check" 
                               value="${ubicacion.id}" data-nombre="${ubicacion.nombre}">
                        <span class="orden-seleccion d-none"></span>
                    </td>
                    <td>${ubicacion.nombre}</td>
                    <td><span class="badge ${getEstadoBadgeClass(ubicacion.estado)}">
                        ${ubicacion.estado}
                    </span></td>
                `;
                ubicacionesList.appendChild(row);
            });

            // Agregar evento para manejar el orden de selección
            document.querySelectorAll('.ubicacion-check').forEach(checkbox => {
                checkbox.addEventListener('change', function () {
                    if (this.checked) {
                        // Asignar número de orden cuando se selecciona
                        const orden = document.querySelectorAll('#ubicaciones-list input[type="checkbox"]:checked').length;
                        this.nextElementSibling.textContent = orden;
                        this.nextElementSibling.classList.remove('d-none');
                    } else {
                        // Ocultar y reordenar cuando se deselecciona
                        this.nextElementSibling.classList.add('d-none');
                        actualizarOrdenSeleccion();
                    }

                });
            });
        } else {
            ubicacionesList.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center text-muted py-3">
                        ${result.message || 'No hay ubicaciones activas disponibles'}
                    </td>
                </tr>`;
        }
    } catch (error) {
        console.error('Error al cargar ubicaciones:', error);
        ubicacionesList.innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-danger py-3">
                    Error al cargar ubicaciones. Intente nuevamente.
                </td>
            </tr>`;
    }
}

// Función para actualizar el orden de selección después de deseleccionar
function actualizarOrdenSeleccion() {
    const checkboxesSeleccionados = document.querySelectorAll('#ubicaciones-list input[type="checkbox"]:checked');

    checkboxesSeleccionados.forEach((checkbox, index) => {
        const spanOrden = checkbox.nextElementSibling;
        spanOrden.textContent = index + 1;
        spanOrden.classList.remove('d-none');
    });
}


// Función para obtener clase CSS según el estado
function getEstadoBadgeClass(estado) {
    switch (estado.toLowerCase()) {
        case 'activa': return 'bg-success';
        case 'suspendida': return 'bg-secondary-subtle text-dark';
        case 'bloqueada': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

// Inicializar la función cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    formAddRuta();
});