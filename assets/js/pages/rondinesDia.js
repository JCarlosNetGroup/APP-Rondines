document.addEventListener('DOMContentLoaded', function () {
    // Elementos del DOM
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const menuItems = document.querySelectorAll('.mobile-menu-item');
    const rondinesList = document.getElementById('rondines-list');
    const emptyState = document.getElementById('empty-state');

    // Crear elemento de carga dinámicamente
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

    // Función para abrir/cerrar el menú móvil
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

    // Eventos del menú
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

    // NUEVA FUNCIÓN: Para llamar al backend e iniciar/reiniciar un ciclo
    async function iniciarOReiniciarCiclo(rondinId) {
        try {
            const response = await fetch('../controller/iniciarCicloRondin.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `id_rondin=${rondinId}`
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error desconocido al iniciar/reiniciar ciclo en el servidor.');
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Error en la respuesta de inicio/reinicio de ciclo.');
            }

            return data.new_cycle_id; // Devuelve el nuevo ciclo_id generado por el servidor
        } catch (error) {
            console.error('Error al iniciar o reiniciar el ciclo del rondín:', error);
            Swal.fire('Error', 'No se pudo iniciar/reiniciar el rondín: ' + error.message, 'error');
            return null; // Retorna null si hubo un error
        }
    }

    // Función para cargar los rondines
    function cargarRondines() {
        if (!rondinesList || !emptyState || !loadingIndicator) return;

        // Mostrar indicador de carga
        loadingIndicator.classList.remove('d-none');
        rondinesList.innerHTML = '';
        emptyState.classList.add('d-none');

        fetch('../controller/getRutas.php?estado=Activa')
            .then(response => {
                if (!response.ok) throw new Error('Error en la respuesta del servidor');
                return response.json();
            })
            .then(data => {
                loadingIndicator.classList.add('d-none');

                if (data.success && data.rutas && data.rutas.length > 0) {
                    data.rutas.forEach(rondin => {
                        const item = document.createElement('a');
                        item.className = 'list-group-item list-group-item-action';
                        item.href = '#';

                        // Calcular progreso
                        // Aseguramos que totalUbicaciones sea al menos 1 para evitar división por cero
                        const totalUbicaciones = parseInt(rondin.total_ubicaciones) || 0;
                        const ubicacionesEscaneadas = parseInt(rondin.ubicaciones_escaneadas) || 0;
                        const porcentajeCompletado = totalUbicaciones > 0 ? Math.round((ubicacionesEscaneadas / totalUbicaciones) * 100) : 0;
                        const ubicacionesFaltantes = totalUbicaciones - ubicacionesEscaneadas;

                        // Determinar estado y estilos del badge
                        // Asegúrate que getRutas.php devuelve 'Nuevo', 'Completado', 'Pendientes'
                        const isNuevo = rondin.estado_ruta === 'Nuevo';
                        const isCompleto = rondin.estado_ruta === 'Completado';
                        const isIncompleto = rondin.estado_ruta === 'Pendientes';
                        const isSinUbicaciones = totalUbicaciones === 0;

                        let badgeText, badgeClass, badgeIcon, progressHtml, progressDescription;

                        if (isCompleto) {
                            badgeText = 'Completado';
                            badgeClass = 'bg-success';
                            badgeIcon = '<i class="bi bi-check-circle-fill me-1"></i>';
                            progressHtml = `
                                            <div class="progress mt-2" style="height: 5px;">
                                                <div class="progress-bar bg-success"
                                                    role="progressbar"
                                                    style="width: 100%"
                                                    aria-valuenow="100"
                                                    aria-valuemin="0"
                                                    aria-valuemax="100">
                                                </div>
                                            </div>`;
                            progressDescription = `<small class="text-success d-block mt-1">${ubicacionesEscaneadas} de ${totalUbicaciones} ubicaciones completadas</small>`;
                       
                        } else if (isNuevo) {
                            badgeText = `<span class="fw-bold">Nuevo</span>`;
                            badgeClass = 'bg-custom-new'; 
                            badgeIcon = '';
                            progressHtml = '';
                            progressDescription = `<small class="text-muted d-block mt-1">0 de ${totalUbicaciones} ubicaciones</small>`;
                        
                        } else if (isIncompleto) {
                            badgeText = `<span class="fw-bold p-1">${porcentajeCompletado}%</span>`;
                            badgeClass = 'bg-custom-progress';
                            badgeIcon = '';
                            progressHtml = `
                                            <div class="progress mt-2" style="height: 5px;">
                                                <div class="progress-bar bg-warning"
                                                    role="progressbar"
                                                    style="width: ${porcentajeCompletado}%"
                                                    aria-valuenow="${porcentajeCompletado}"
                                                    aria-valuemin="0"
                                                    aria-valuemax="100">
                                                </div>
                                            </div>`;
                            progressDescription = `<small class="text-muted d-block mt-1">${ubicacionesEscaneadas} de ${totalUbicaciones} completadas (${ubicacionesFaltantes} faltantes)</small>`;
                        
                        } else if (isSinUbicaciones) {
                            badgeText = 'Sin Ubicaciones';
                            badgeClass = 'bg-secondary';
                            badgeIcon = '<i class="bi bi-info-circle-fill me-1"></i>';
                            progressHtml = '';
                            progressDescription = '<small class="text-muted d-block mt-1">Este rondín no tiene ubicaciones.</small>';
                        }


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
                                        ${badgeIcon}${badgeText}
                                    </span>
                                    <i class="bi bi-chevron-right text-muted"></i>
                                </div>
                            </div>
                        `;

                        item.addEventListener('click', function (e) {
                            e.preventDefault();
                            // Pasamos el objeto rondin completo a handleRondinClick
                            handleRondinClick(rondin);
                        });

                        rondinesList.appendChild(item);
                    });
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

    // Función para manejar el clic en un rondín y mostrar el modal
    async function handleRondinClick(rondin) { // ¡IMPORTANTE: Haz esta función ASÍNCRONA!
        const totalUbicaciones = parseInt(rondin.total_ubicaciones) || 0;
        const ubicacionesEscaneadas = parseInt(rondin.ubicaciones_escaneadas) || 0;
        const ubicacionesFaltantes = totalUbicaciones - ubicacionesEscaneadas;
        const currentCycleIdFromBackend = rondin.current_cycle_id || ''; // El ciclo_id actual del backend

        // Usar rondin.estado_ruta para la lógica principal
        const isNuevo = rondin.estado_ruta === 'Nuevo';
        const isCompleto = rondin.estado_ruta === 'Completado';
        const isIncompleto = rondin.estado_ruta === 'Pendientes';
        const isSinUbicaciones = totalUbicaciones === 0;

        let titleText, iconType, confirmButtonText, showCancelButton, cancelButtonText, showDenyButton, denyButtonText, htmlContent;

        if (isCompleto) {
            titleText = 'Rondín Completado';
            iconType = 'success';
            confirmButtonText = 'Ver detalles';
            showCancelButton = false;
            cancelButtonText = '';
            showDenyButton = true; // Opción de reiniciar
            denyButtonText = 'Reiniciar';
            denyButtonColor = '#dc3545';
            htmlContent = `
                <b>${rondin.nombre}</b>
                <div class="progress mt-3" style="height: 10px;">
                    <div class="progress-bar bg-success" style="width: 100%"></div>
                </div>
                <small class="text-muted d-block mt-1">
                    ${ubicacionesEscaneadas} de ${totalUbicaciones} ubicaciones completadas
                </small>`;
        } else if (isNuevo) {
            titleText = `¿Qué deseas hacer con este rondín?`;
            iconType = 'question';
            confirmButtonText = 'Comenzar';
            showCancelButton = false; // No hay opción de "Comenzar de nuevo" si es nuevo
            cancelButtonText = '';
            showDenyButton = false; // No hay opción de reiniciar
            denyButtonText = '';
            htmlContent = `
                <b>${rondin.nombre}</b>
                <small class="text-muted d-block mt-3">
                    Este rondín aún no ha sido iniciado.
                </small>`;
        } else if (isIncompleto) {
            titleText = `¿Qué deseas hacer con este rondín?`;
            iconType = 'question';
            confirmButtonText = 'Continuar';
            showCancelButton = true;
            cancelButtonText = 'Reiniciar progreso'; // Cambiado de "Comenzar de nuevo"
            showDenyButton = false;
            denyButtonText = '';
            htmlContent = `
                <b>${rondin.nombre}</b>
                <div class="progress mt-3" style="height: 10px;">
                    <div class="progress-bar bg-primary"
                        role="progressbar"
                        style="width: ${Math.round((ubicacionesEscaneadas / totalUbicaciones) * 100)}%"
                        aria-valuenow="${ubicacionesEscaneadas}"
                        aria-valuemin="0"
                        aria-valuemax="${totalUbicaciones}">
                    </div>
                </div>
                <small class="text-muted d-block mt-1">
                    ${ubicacionesEscaneadas} de ${totalUbicaciones} ubicaciones completadas (${ubicacionesFaltantes} faltantes)
                </small>`;
        } else if (isSinUbicaciones) { // Rondín sin ubicaciones
            titleText = 'Rondín sin ubicaciones';
            iconType = 'info';
            confirmButtonText = 'Aceptar';
            showCancelButton = false;
            cancelButtonText = '';
            showDenyButton = false;
            denyButtonText = '';
            htmlContent = `<b>${rondin.nombre}</b>
                           <small class="text-muted d-block mt-3">
                               Este rondín no tiene ubicaciones asignadas.
                           </small>`;
        }


        Swal.fire({
            title: titleText,
            html: htmlContent,
            icon: iconType,
            showConfirmButton: true,
            confirmButtonText: confirmButtonText,
            confirmButtonColor: '#283747',
            showCancelButton: showCancelButton,
            cancelButtonText: cancelButtonText,
            cancelButtonColor: '#ffc107',
            showDenyButton: showDenyButton,
            denyButtonText: denyButtonText,
            denyButtonColor: '#dc3545'
        }).then(async (result) => { // ¡IMPORTANTE: Haz esta función ASÍNCRONA!
            if (isSinUbicaciones && result.isConfirmed) {
                // Si no hay ubicaciones, solo cerrar el modal
                return;
            }

            let currentRondinId = rondin.id_rondin;
            let cycleIdToPass = currentCycleIdFromBackend; // Por defecto, usamos el del backend

            if (result.isConfirmed) {
                let action = '';

                if (isNuevo) {
                    action = 'start';
                    // Si es un rondín NUEVO, llamamos a iniciarOReiniciarCiclo para crear el ciclo
                    const newCycleId = await iniciarOReiniciarCiclo(currentRondinId);
                    if (newCycleId) {
                        cycleIdToPass = newCycleId;
                        localStorage.setItem(`rondin_${currentRondinId}_current_cycle`, cycleIdToPass);
                    } else {
                        return; // Si falla la creación del ciclo, no continuamos
                    }
                } else if (isCompleto) {
                    action = 'view';
                    // Para ver detalles de un rondín completado, usamos el ciclo_id que ya tenemos
                    // No generamos uno nuevo.
                } else if (isIncompleto) {
                    action = 'continue';
                    // Para continuar un rondín, usamos el ciclo_id que ya está en curso.
                    // No generamos uno nuevo.
                }

                // Si tenemos un cycleIdToPass válido, redirigimos
                if (cycleIdToPass) {
                    window.location.href = `ubicacionesRuta.php?id_rondin=${currentRondinId}&action=${action}&cycle_id=${cycleIdToPass}`;
                } else {
                    Swal.fire('Error', 'No se pudo obtener el ID del ciclo para continuar. Inténtalo de nuevo.', 'error');
                }

            } else if (result.dismiss === Swal.DismissReason.cancel || result.isDenied) {
                // Esta es la lógica para los botones de "Reiniciar progreso" (cancel) o "Reiniciar" (deny)
                Swal.fire({
                    title: '¿Estás seguro?',
                    text: 'Esto iniciará un nuevo ciclo para este rondín. El progreso anterior no se perderá, pero no será visible en este nuevo ciclo.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#dc3545',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: 'Sí, reiniciar',
                    cancelButtonText: 'No, cancelar'
                }).then(async (confirmRestartResult) => { // ¡IMPORTANTE: Esta función interna también debe ser ASÍNCRONA!
                    if (confirmRestartResult.isConfirmed) {
                        // Al reiniciar, SIEMPRE llamamos a iniciarOReiniciarCiclo para crear un nuevo ciclo
                        const newCycleId = await iniciarOReiniciarCiclo(currentRondinId);
                        if (newCycleId) {
                            cycleIdToPass = newCycleId;
                            localStorage.setItem(`rondin_${currentRondinId}_current_cycle`, cycleIdToPass);
                            // Redirige a ubicacionesRuta.php con la acción 'restart' y el nuevo cycle_id
                            window.location.href = `ubicacionesRuta.php?id_rondin=${currentRondinId}&action=restart&cycle_id=${cycleIdToPass}`;
                        }
                    }
                });
            }
        });
    }

    // Cargar rondines al iniciar
    cargarRondines();
});