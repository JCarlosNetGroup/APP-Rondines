document.addEventListener('DOMContentLoaded', function () {
    // Función para cargar los rondines
    function cargarRondines() {
        const rondinesList = document.getElementById('rondines-list');
        const emptyState = document.getElementById('empty-state');

        fetch('../controller/getRutas.php?estado=Activa')
            .then(response => response.json())
            .then(data => {
                // Limpiar lista
                rondinesList.innerHTML = '';

                if (data.success && data.rutas.length > 0) {
                    // Mostrar cada rondín
                    data.rutas.forEach(rondin => {
                        const item = document.createElement('a');
                        item.className = 'list-group-item list-group-item-action';
                        item.href = `ubicacionesRuta.php?id_rondin=${rondin.id_rondin}`;

                        item.innerHTML = `
                            <div class="d-flex w-100 justify-content-between align-items-center">
                                <div>
                                    <h5 class="mb-1">${rondin.nombre}</h5>
                                    <div class="d-flex align-items-center mt-2">
                                        <i class="bi bi-clock me-2" style="font-size: 0.9rem;"></i>
                                        <small>${rondin.hora_inicio} - ${rondin.hora_fin}</small>
                                    </div>
                                </div>
                                <i class="bi bi-chevron-right text-muted"></i>
                            </div>
                        `;

                        rondinesList.appendChild(item);
                    });

                    emptyState.classList.add('d-none');
                } else {
                    // No hay rondines para mostrar
                    emptyState.classList.remove('d-none');
                }
            })
            .catch(error => {
                console.error('Error al cargar los rondines:', error);
                document.getElementById('empty-state').classList.remove('d-none');
            });
    }

    // Cargar los rondines al iniciar la página
    cargarRondines();
});