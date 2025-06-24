document.addEventListener('DOMContentLoaded', function () {
    // Elementos del DOM
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const menuItems = document.querySelectorAll('.mobile-menu-item');

    // Función para abrir el menú
    function openMenu() {
        document.body.classList.add('menu-open');
        mobileMenu.classList.add('show');
        menuOverlay.classList.add('show');
    }

    // Función para cerrar el menú
    function closeMenu() {
        document.body.classList.remove('menu-open');
        mobileMenu.classList.remove('show');
        menuOverlay.classList.remove('show');
    }

    // Evento para el botón del menú
    menuBtn.addEventListener('click', openMenu);

    // Cerrar menú al hacer clic en el overlay
    menuOverlay.addEventListener('click', closeMenu);

    // Manejar clics en los items del menú
    menuItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.stopPropagation(); // Evita que el evento llegue al overlay

            // Cerrar el menú inmediatamente
            closeMenu();

            // Redirigir después de un pequeño retraso para la animación
            setTimeout(() => {
                window.location.href = this.getAttribute('href');
            }, 200);
        });
    });

    // Función para cargar los rondines (mantenida igual)
    function cargarRondines() {
        const rondinesList = document.getElementById('rondines-list');
        const emptyState = document.getElementById('empty-state');

        fetch('../controller/getRutas.php?estado=Activa')
            .then(response => response.json())
            .then(data => {
                rondinesList.innerHTML = '';

                if (data.success && data.rutas.length > 0) {
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