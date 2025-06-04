document.addEventListener('DOMContentLoaded', function () {
    // Obtener el ID del rondín de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const rondinId = urlParams.get('id_rondin');

    // Botón de regreso
    document.getElementById('back-btn').addEventListener('click', function() {
        window.history.back();
    });

    // Función para cargar las ubicaciones
    function cargarUbicaciones() {
        const ubicacionesList = document.getElementById('ubicaciones-list');
        const emptyState = document.getElementById('empty-state');

        if (!rondinId) {
            emptyState.classList.remove('d-none');
            return;
        }

        fetch(`../controller/getUbicacionesRuta.php?id_rondin=${rondinId}`)
            .then(response => response.json())
            .then(data => {
                // Limpiar lista
                ubicacionesList.innerHTML = '';

                if (data.success && data.ubicaciones.length > 0) {
                    // Mostrar cada ubicación
                    data.ubicaciones.forEach((ubicacion, index) => {
                        const item = document.createElement('div');
                        item.className = 'list-group-item list-group-item-action';

                        item.innerHTML = `
                            <div class="d-flex w-100 justify-content-between align-items-center">
                                <div class="d-flex align-items-center">
                                    <span class="badge me-3">${index + 1}</span>
                                    <div>
                                        <h5 class="mb-1">${ubicacion.nombre}</h5>
                                        <small class="text-muted">${ubicacion.descripcion}</small>
                                    </div>
                                </div>
                                <i class="bi bi-chevron-right text-muted"></i>
                            </div>
                        `;

                        ubicacionesList.appendChild(item);
                    });

                    emptyState.classList.add('d-none');
                } else {
                    // No hay ubicaciones para mostrar
                    emptyState.classList.remove('d-none');
                }
            })
            .catch(error => {
                console.error('Error al cargar las ubicaciones:', error);
                emptyState.classList.remove('d-none');
            });
    }

    // Cargar las ubicaciones al iniciar la página
    cargarUbicaciones();
});