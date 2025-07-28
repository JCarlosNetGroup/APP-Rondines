document.addEventListener('DOMContentLoaded', function () {
    // Elementos del DOM (mantenemos los mismos)
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const menuItems = document.querySelectorAll('.mobile-menu-item');
    const rondinesList = document.getElementById('rondines-list');
    const emptyState = document.getElementById('empty-state');

    // Crear elemento de carga dinámicamente (igual)
    let loadingIndicator = document.getElementById('loading-indicator');
    if (!loadingIndicator) {
        loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'loading-indicator';
        loadingIndicator.className = 'text-center py-4 d-none';
        loadingIndicator.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Cargando rondines...</p>
        `;
        document.querySelector('main').prepend(loadingIndicator);
    }

    // Función para abrir/cerrar el menú móvil (igual)
    function toggleMenu() {
        if (!mobileMenu || !menuOverlay) return;

        const isOpen = mobileMenu.classList.contains('show');
        if (isOpen) {
            mobileMenu.classList.remove('show');
            menuOverlay.classList.remove('show');
            document.body.classList.remove('menu-open');
        } else {
            mobileMenu.classList.add('show');
            menuOverlay.classList.add('show');
            document.body.classList.add('menu-open');
        }
    }

    // Eventos del menú (igual)
    if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
    if (menuOverlay) menuOverlay.addEventListener('click', toggleMenu);

    if (menuItems) {
        menuItems.forEach(item => {
            item.addEventListener('click', function (e) {
                e.stopPropagation();
                toggleMenu();
                setTimeout(() => {
                    window.location.href = this.getAttribute('href');
                }, 200);
            });
        });
    }

    // Función para cargar TODOS los rondines PENDIENTES de TODOS los ciclos
    function cargarRondines() {
        if (!rondinesList || !emptyState || !loadingIndicator) return;

        // Mostrar indicador de carga
        loadingIndicator.classList.remove('d-none');
        rondinesList.innerHTML = '';
        emptyState.classList.add('d-none');

        // Cambiamos la URL para obtener todos los rondines pendientes sin filtrar por ciclo
        fetch('../controller/getRutasPendientes.php')
            .then(response => {
                if (!response.ok) throw new Error('Error en la respuesta del servidor');
                return response.json();
            })
            .then(data => {
                loadingIndicator.classList.add('d-none');

                if (data.success && data.rutas && data.rutas.length > 0) {
                    // Filtrar solo los rondines con estado "Pendientes" de todos los ciclos
                    const rondinesPendientes = data.rutas.filter(rondin => {
                        return rondin.estado_ruta === 'Pendientes';
                    });

                    if (rondinesPendientes.length > 0) {
                        // Ordenar por ciclo (opcional)
                        rondinesPendientes.sort((a, b) => {
                            return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
                        });

                        rondinesPendientes.forEach(rondin => {
                            const item = document.createElement('a');
                            item.className = 'list-group-item list-group-item-action';
                            item.href = '#';

                            // Calcular progreso
                            const totalUbicaciones = parseInt(rondin.total_ubicaciones) || 0;
                            const ubicacionesEscaneadas = parseInt(rondin.ubicaciones_escaneadas) || 0;
                            const porcentajeCompletado = totalUbicaciones > 0 ? Math.round((ubicacionesEscaneadas / totalUbicaciones) * 100) : 0;
                            const ubicacionesFaltantes = totalUbicaciones - ubicacionesEscaneadas;

                            // Configuración para estado "Pendientes"
                            const badgeText = `${porcentajeCompletado}% completado`;
                            const badgeClass = 'bg-warning text-dark';
                            const progressHtml = `
                                <div class="progress mt-2" style="height: 5px;">
                                    <div class="progress-bar bg-warning"
                                        role="progressbar"
                                        style="width: ${porcentajeCompletado}%"
                                        aria-valuenow="${porcentajeCompletado}"
                                        aria-valuemin="0"
                                        aria-valuemax="100">
                                    </div>
                                </div>`;
                            const progressDescription = `<small class="text-muted d-block mt-1">${ubicacionesEscaneadas} de ${totalUbicaciones} ubicaciones completadas</small>`;

                            // Mostrar información del ciclo si está disponible
                            // const cicloInfo = rondin.nombre_ciclo ? `<small class="text-info d-block">Ciclo: ${rondin.nombre_ciclo}</small>` : '';

                            item.innerHTML = `
                                <div class="d-flex w-100 justify-content-between align-items-center">
                                    <div>
                                        <h5 class="mb-1">${rondin.nombre}</h5>
                                        <p class="mb-1 text-muted small">${rondin.descripcion || ''}</p>
                                        <div class="d-flex align-items-center mt-2">
                                            <i class="bi bi-clock me-2" style="font-size: 0.9rem;"></i>
                                            <small>${rondin.hora_inicio} - ${rondin.hora_fin}</small>
                                        </div>
                                        ${progressHtml}
                                        ${progressDescription}
                                    </div>
                                    <div class="d-flex align-items-center">
                                        <span class="badge ${badgeClass} rounded-pill me-2">
                                            ${badgeText}
                                        </span>
                                        <i class="bi bi-chevron-right text-muted"></i>
                                    </div>
                                </div>
                            `;

                            item.addEventListener('click', function (e) {
                                e.preventDefault();
                                mostrarModalCerrarRondin(rondin);
                            });

                            rondinesList.appendChild(item);
                        });
                    } else {
                        emptyState.classList.remove('d-none');
                    }
                } else {
                    emptyState.classList.remove('d-none');
                }
            })
            .catch(error => {
                console.error('Error al cargar los rondines:', error);
                loadingIndicator.classList.add('d-none');
                emptyState.innerHTML = `
                    <i class="bi bi-exclamation-triangle fs-1 text-danger"></i>
                    <p class="text-danger">Error al cargar los rondines</p>
                    <button class="btn btn-sm btn-outline-primary" onclick="location.reload()">
                        Reintentar
                    </button>
                `;
                emptyState.classList.remove('d-none');
            });
    }

    // Las funciones mostrarModalCerrarRondin y cerrarRondin se mantienen igual
    function mostrarModalCerrarRondin(rondin) {
        const totalUbicaciones = parseInt(rondin.total_ubicaciones) || 0;
        const ubicacionesEscaneadas = parseInt(rondin.ubicaciones_escaneadas) || 0;
        const porcentajeCompletado = totalUbicaciones > 0 ? Math.round((ubicacionesEscaneadas / totalUbicaciones) * 100) : 0;

        Swal.fire({
            title: '¿Deseas cerrar este rondín?',
            html: `
                <b>${rondin.nombre}</b>
                ${rondin.nombre_ciclo ? `<small class="text-info d-block">Ciclo: ${rondin.nombre_ciclo}</small>` : ''}
                <div class="progress mt-3" style="height: 10px;">
                    <div class="progress-bar bg-warning"
                        role="progressbar"
                        style="width: ${porcentajeCompletado}%"
                        aria-valuenow="${porcentajeCompletado}"
                        aria-valuemin="0"
                        aria-valuemax="100">
                    </div>
                </div>
                <small class="text-muted d-block mt-1">
                    ${ubicacionesEscaneadas} de ${totalUbicaciones} ubicaciones completadas (${porcentajeCompletado}%)
                </small>
                <p class="mt-3">Al cerrar el rondín, no podrás continuar con el progreso actual.</p>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, cerrar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6'
        }).then((result) => {
            if (result.isConfirmed) {
                cerrarRondin(rondin.id_rondin);
            }
        });
    }

    function cerrarRondin(rondinId) {
        Swal.fire({
            title: 'Cerrando rondín...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        fetch('../controller/cerrarRondin.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id_rondin=${rondinId}`
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Rondín cerrado',
                        text: 'El rondín ha sido cerrado correctamente',
                        confirmButtonColor: '#3085d6'
                    }).then(() => {
                        cargarRondines();
                    });
                } else {
                    throw new Error(data.message || 'Error al cerrar el rondín');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message,
                    confirmButtonColor: '#3085d6'
                });
            });
    }

    // Cargar rondines al iniciar
    cargarRondines();
});