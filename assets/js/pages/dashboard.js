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
// * MÓDULO PRINCIPAL DE COMUNICADOS CON EFECTOS DE PAGINACIÓN
// =============================================
const ComunicadosModule = (() => {
    // Referencias a los modales de Bootstrap
    let bsAddModal;
    let bsViewModal;
    let bsEditModal;

    // Referencias a los elementos de filtro
    let searchInput;
    let dateFromInput;
    let dateToInput;
    let statusSelect;

    // Función para obtener clase CSS de prioridad
    const getPrioridadBadgeClass = (prioridad) => {
        switch (prioridad.toLowerCase()) {
            case 'importante':
                return 'bg-prioridad-importante';
            case 'medio':
                return 'bg-prioridad-medio';
            default:
                return 'bg-secondary';
        }
    };

    // Función para obtener clase CSS de estado (NUEVA)
    const getEstadoBadgeClass = (estado) => {
        switch (estado.toLowerCase()) {
            case 'vigente':
                return 'bg-estado-vigente';
            case 'expirado':
                return 'bg-secondary';
            default:
                return 'bg-secondary';
        }
    };

    // Inicializar el módulo
    const init = () => {
        // Inicializar los modales de Bootstrap
        const addModalElement = document.getElementById('miModal');
        const viewModalElement = document.getElementById('verComunicadoModal');
        const editModalElement = document.getElementById('editarModal');

        if (addModalElement) bsAddModal = new bootstrap.Modal(addModalElement);
        if (viewModalElement) bsViewModal = new bootstrap.Modal(viewModalElement);
        if (editModalElement) bsEditModal = new bootstrap.Modal(editModalElement);

        // Obtener referencias a los elementos de filtro
        searchInput = document.getElementById('search-comunicado-input');
        dateFromInput = document.getElementById('filter-date-from');
        dateToInput = document.getElementById('filter-date-to');
        statusSelect = document.getElementById('filter-comunicado-select');

        formComunicados();
        handleEditFormSubmit();
        loadComunicados(1);
        loadMainComunicado();
        setupFilterListeners();

        // Delegación de eventos centralizada
        document.addEventListener('click', (event) => {
            const target = event.target;

            // Botón Editar en modal de visualización
            if (target?.id === 'btnEditarDesdeVerModal') {
                const comunicadoId = document.getElementById('verComunicadoModal')?.dataset.comunicadoId;
                if (comunicadoId) {
                    bsViewModal?.hide();
                    editComunicado(comunicadoId);
                }
                return;
            }

            // Botones Ver en lista de comunicados
            if (target?.classList.contains('btn-view')) {
                const id = target.dataset.comunicadoId;
                if (id) viewComunicado(id);
                return;
            }

            // Botón Leer más en comunicado principal
            if (target?.classList.contains('btn-read-more')) {
                const id = target.dataset.comunicadoId;
                if (id) viewComunicado(id);
                return;
            }

            // Botón Editar en comunicado principal
            if (target?.classList.contains('btn-edit-main')) {
                const id = target.dataset.comunicadoId;
                if (id) editComunicado(id);
            }
        });
    };

    // ======================
    // FUNCIONES DEL FORMULARIO
    // ======================

    // Configurar formulario para añadir comunicados
    const formComunicados = () => {
        const form = document.querySelector("#formComunicado");
        const modal = document.getElementById('miModal');

        if (form && modal) {
            modal.addEventListener('show.bs.modal', () => {
                form.reset();
                setMinDateForExpiration('fechaExpiracion');
            });

            form.addEventListener("submit", handleFormSubmit(
                bsAddModal,
                '../controller/addComunicado.php',
                'Comunicado publicado correctamente'
            ));
        }
    };

    // Configurar formulario para editar comunicados
    const handleEditFormSubmit = () => {
        const form = document.querySelector("#formEditarComunicado");
        const modal = document.getElementById('editarModal');

        if (form && modal) {
            modal.addEventListener('show.bs.modal', () => {
                setMinDateForExpiration('editarFechaExpiracion');
            });

            form.addEventListener("submit", handleFormSubmit(
                bsEditModal,
                '../controller/updateComunicado.php',
                'Comunicado actualizado correctamente'
            ));
        }
    };

    // Función genérica para manejar envío de formularios
    const handleFormSubmit = (bootstrapModalInstance, endpoint, successMessage) => async (event) => {
        event.preventDefault();
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        try {
            const formData = new FormData(form);
            validateExpirationDate(formData.get('fecha_expiracion'));

            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (!data.success) throw new Error(data.message);

            await NotificationModule.showSuccess(successMessage);
            bootstrapModalInstance.hide();
            form.reset();
            loadComunicados(1);
            loadMainComunicado();
        } catch (error) {
            await NotificationModule.showError(error.message);
        } finally {
            submitBtn.disabled = false;
        }
    };

    // ======================
    // FUNCIONES DE FECHA
    // ======================

    // Establecer fecha mínima para expiración
    const setMinDateForExpiration = (elementId) => {
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById(elementId);
        if (dateInput) {
            dateInput.min = today;
        }
    };

    // Validar fecha de expiración
    const validateExpirationDate = (expirationDate) => {
        if (!expirationDate) {
            throw new Error('La fecha de expiración es requerida.');
        }

        const fechaExpiracion = new Date(expirationDate + 'T23:59:59');
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (fechaExpiracion < hoy) {
            throw new Error('La fecha de expiración no puede ser anterior a hoy');
        }
    };

    // Formatear fecha
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const offset = date.getTimezoneOffset() * 60 * 1000;
        const localDate = new Date(date.getTime() + offset);

        const day = String(localDate.getDate()).padStart(2, '0');
        const month = String(localDate.getMonth() + 1).padStart(2, '0');
        const year = localDate.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // ======================
    // FUNCIONES DE FILTRO
    // ======================

    // Configurar listeners para los elementos de filtro
    const setupFilterListeners = () => {
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    loadComunicados(1);
                }, 300);
            });
        }

        if (dateFromInput) {
            dateFromInput.addEventListener('change', () => loadComunicados(1));
        }
        if (dateToInput) {
            dateToInput.addEventListener('change', () => loadComunicados(1));
        }
        if (statusSelect) {
            statusSelect.addEventListener('change', () => loadComunicados(1));
        }

        const prioridadSelect = document.getElementById('filter-comunicado-prioridad');
        if (prioridadSelect) {
            prioridadSelect.addEventListener('change', () => loadComunicados(1));
        }

    };

    // Obtener los parámetros de filtro actuales
    const getFilterParams = () => {
        const params = new URLSearchParams();
        if (searchInput && searchInput.value) {
            params.append('search', searchInput.value.trim());
        }
        if (dateFromInput && dateFromInput.value) {
            params.append('dateFrom', dateFromInput.value);
        }
        if (dateToInput && dateToInput.value) {
            params.append('dateTo', dateToInput.value);
        }
        if (statusSelect && statusSelect.value) {
            params.append('status', statusSelect.value);
        }

        const prioridadSelect = document.getElementById('filter-comunicado-prioridad');
        if (prioridadSelect && prioridadSelect.value) {
            params.append('prioridad', prioridadSelect.value);
        }

        return params.toString();
    };

    // ======================
    // FUNCIONES DE CARGA Y RENDERIZADO
    // ======================

    // Cargar comunicados paginados con animación
    const loadComunicados = async (page) => {
        const container = document.getElementById('comunicados-container');
        if (!container) return;

        const filterParams = getFilterParams();
        const url = `../controller/getComunicados.php?page=${page}&${filterParams}`;

        animateOut(container, async () => {
            try {
                container.innerHTML = createLoaderHTML();

                const response = await fetch(url);
                const data = await response.json();

                if (data.success) {
                    renderComunicadosWithAnimation(data.comunicados);
                    renderPaginationWithEffects(data.pagination);
                } else {
                    container.innerHTML = createNoResultsHTML();
                    console.error('Error al cargar comunicados:', data.message);
                }
            } catch (error) {
                container.innerHTML = createErrorHTML();
                console.error('Error de red:', error);
            }
        });
    };

    // Cargar comunicado principal
    const loadMainComunicado = async () => {
        const container = document.getElementById('main-comunicado-container');
        if (!container) return;

        container.innerHTML = createMainComunicadoLoaderHTML();

        try {
            const response = await fetch(`../controller/getComunicadoPrincipal.php`);
            const data = await response.json();

            if (data.success && data.comunicado) {
                renderMainComunicado(data.comunicado);
            } else {
                container.innerHTML = createNoMainComunicadoHTML();
            }
        } catch (error) {
            container.innerHTML = createMainComunicadoErrorHTML();
        }
    };

    // ======================
    // FUNCIONES DE RENDERIZADO
    // ======================

    // Renderizar comunicados con animación
    const renderComunicadosWithAnimation = (comunicados) => {
        const container = document.getElementById('comunicados-container');
        container.innerHTML = '';

        if (comunicados.length === 0) {
            container.innerHTML = createNoResultsHTML();
            return;
        }

        comunicados.forEach((comunicado, index) => {
            const comunicadoElement = document.createElement('div');
            comunicadoElement.className = 'col-md-6 col-lg-4 mb-4 comunicado-item';
            comunicadoElement.style.opacity = '0';
            comunicadoElement.style.transform = 'translateY(20px)';
            comunicadoElement.style.transition = 'all 0.4s ease-out';
            comunicadoElement.style.transitionDelay = `${index * 0.05}s`;

            comunicadoElement.innerHTML = createComunicadoHTML(comunicado);
            container.appendChild(comunicadoElement);

            setTimeout(() => {
                comunicadoElement.style.opacity = '1';
                comunicadoElement.style.transform = 'translateY(0)';
            }, 10);
        });
    };

    // Renderizar paginación
    const renderPaginationWithEffects = (pagination) => {
        const container = document.getElementById('pagination-container');
        if (!container) return;

        if (pagination.totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = '';

        // Botón Anterior
        const prevLi = createPaginationItem(
            '&laquo;',
            'Anterior',
            pagination.currentPage === 1,
            () => loadComunicados(pagination.currentPage - 1)
        );
        container.appendChild(prevLi);

        // Números de página
        for (let i = 1; i <= pagination.totalPages; i++) {
            const pageLi = createPaginationItem(
                i,
                `Página ${i}`,
                i === pagination.currentPage,
                () => loadComunicados(i)
            );
            container.appendChild(pageLi);
        }

        // Botón Siguiente
        const nextLi = createPaginationItem(
            '&raquo;',
            'Siguiente',
            pagination.currentPage === pagination.totalPages,
            () => loadComunicados(pagination.currentPage + 1)
        );
        container.appendChild(nextLi);
    };

    // Mostrar comunicado principal
    const renderMainComunicado = (comunicado) => {
        const container = document.getElementById('main-comunicado-container');
        if (!container) return;

        container.style.opacity = '0';
        container.style.transition = 'opacity 0.3s ease';

        container.innerHTML = createMainComunicadoHTML(comunicado);

        setTimeout(() => {
            container.style.opacity = '1';
        }, 50);
    };

    // ======================
    // FUNCIONES UTILITARIAS
    // ======================

    // Crear elemento de paginación
    const createPaginationItem = (content, ariaLabel, isDisabled, onClick) => {
        const li = document.createElement('li');
        li.className = `page-item ${isDisabled ? 'disabled' : ''}`;

        const a = document.createElement('a');
        a.className = 'page-link';
        a.href = '#';
        a.innerHTML = content;
        a.setAttribute('aria-label', ariaLabel);
        a.addEventListener('click', (e) => {
            e.preventDefault();
            if (!isDisabled) onClick();
        });

        li.appendChild(a);
        return li;
    };

    // Animación de salida para los elementos
    const animateOut = (container, callback) => {
        const items = container.querySelectorAll('.comunicado-item');
        let completed = 0;

        if (items.length === 0) {
            callback();
            return;
        }

        items.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(-20px)';

            item.addEventListener('transitionend', function handler() {
                completed++;
                if (completed === items.length) {
                    callback();
                }
                item.removeEventListener('transitionend', handler);
            }, { once: true });
        });
    };

    // ======================
    // PLANTILLAS HTML
    // ======================

    const createLoaderHTML = () => `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
        </div>
    `;

    const createNoResultsHTML = () => `
        <div class="col-12 text-center py-5">
            <i class="bi bi-info-circle fs-1 text-muted"></i>
            <p class="mt-3">No hay comunicados anteriores</p>
        </div>
    `;

    const createErrorHTML = () => `
        <div class="col-12 text-center py-5 text-danger">
            <i class="bi bi-exclamation-triangle fs-1"></i>
            <p class="mt-3">Error al cargar los comunicados</p>
        </div>
    `;

    const createMainComunicadoLoaderHTML = () => `
        <div class="card-body text-center py-5">
            <i class="bi bi-info-circle fs-1 text-muted"></i>
            <p class="mt-3">Cargando comunicado principal...</p>
        </div>
    `;

    const createNoMainComunicadoHTML = () => `
        <div class="card-body text-center py-5">
            <i class="bi bi-info-circle fs-1 text-muted"></i>
            <p class="mt-3">No hay comunicado principal vigente.</p>
        </div>
    `;

    const createMainComunicadoErrorHTML = () => `
        <div class="card-body text-center py-5 text-danger">
            <i class="bi bi-exclamation-triangle fs-1"></i>
            <p class="mt-3">Error al cargar el comunicado principal.</p>
        </div>
    `;

    const createComunicadoHTML = (comunicado) => {
        const estadoTexto = comunicado.estado_calculado.charAt(0).toUpperCase() + comunicado.estado_calculado.slice(1);

        return `
        <article class="comunicado card h-100 shadow-sm hover-shadow">
            <div class="card-body d-flex flex-column">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="card-title fs-6 mb-0">${comunicado.titulo}</h5>
                    <span class="badge ${getPrioridadBadgeClass(comunicado.prioridad)}">
                        ${comunicado.prioridad.charAt(0).toUpperCase() + comunicado.prioridad.slice(1)}
                    </span>
                </div>
                
                <p class="mb-1">
                    <span class="badge ${getEstadoBadgeClass(comunicado.estado_calculado)}">${estadoTexto}</span>
                </p>

                <p class="card-text text-muted small my-2">
                    Autor: <span>${comunicado.autor}</span>
                </p>

                <p class="card-text flex-grow-1 pt-2">${comunicado.contenido.substring(0, 100)}${comunicado.contenido.length > 100 ? '...' : ''}</p>
            </div>
            
            <div class="card-footer bg-transparent border-0 pt-0">
                <div class="d-flex justify-content-between align-items-center w-100">
                    <p class="card-text text-muted small my-0">
                        Publicado: ${formatDate(comunicado.fecha_publicacion)} - 
                        Expira: ${formatDate(comunicado.fecha_expiracion)}
                    </p>
                    <button class="btn btn-sm btn-outline-secondary btn-view" data-comunicado-id="${comunicado.id_comunicado}">Ver</button>
                </div>
            </div>
        </article>
        `;
    };

    const createMainComunicadoHTML = (comunicado) => {
        const estadoTexto = comunicado.estado_calculado.charAt(0).toUpperCase() + comunicado.estado_calculado.slice(1);

        return `
            <div class="card-body">
                <header>
                    <h5 class="card-title fw-semibold h5 h4-md">${comunicado.titulo}</h5>
                    <span class="badge ${getEstadoBadgeClass(comunicado.estado_calculado)} mb-2">${estadoTexto}</span>
                    <span class="badge ${getPrioridadBadgeClass(comunicado.prioridad)} mb-2 ms-2">
                        ${comunicado.prioridad.charAt(0).toUpperCase() + comunicado.prioridad.slice(1)}
                    </span>
                </header>
                
                <p class="small text-muted mb-0">Autor: ${comunicado.autor}</p>

                <div class="contenido-comunicado py-2">
                    <div class="row align-items-center">
                        <div class="col-12">
                            <p class="card-text small small-md">${comunicado.contenido.substring(0, 500)}${comunicado.contenido.length > 500 ? '...' : ''}</p>
                            ${comunicado.contenido.length > 500 ? `<div class="d-flex mt-3"><button class="btn btn-outline-primary btn-sm btn-read-more" data-comunicado-id="${comunicado.id_comunicado}">Leer más</button></div>` : ''}
                        </div>
                    </div>
                </div>

                <footer class="d-flex justify-content-between align-items-center pt-3 border-top mt-3">
                    <span class="fechaComunicado text-muted small">Publicado: <span class="fw-semibold">${formatDate(comunicado.fecha_publicacion)}</span></span>
                </footer>
            </div>
        `;
    };

    // ======================
    // FUNCIONES DE VISTA/EDICIÓN
    // ======================

    // Ver detalles de un comunicado
    const viewComunicado = async (id) => {
        try {
            const response = await fetch(`../controller/getComunicadoById.php?id=${id}`);
            const data = await response.json();

            if (data.success && data.comunicado) {
                const comunicado = data.comunicado;

                document.getElementById('viewComunicadoTitulo').textContent = comunicado.titulo;
                document.getElementById('viewComunicadoContenido').textContent = comunicado.contenido;
                document.getElementById('viewComunicadoFechaPublicacion').textContent = formatDate(comunicado.fecha_publicacion);
                document.getElementById('viewComunicadoFechaExpiracion').textContent = formatDate(comunicado.fecha_expiracion);
                document.getElementById('viewComunicadoAutor').textContent = comunicado.autor;

                // Badge de prioridad
                const prioridadBadge = document.getElementById('viewComunicadoPrioridad');
                prioridadBadge.textContent = comunicado.prioridad.charAt(0).toUpperCase() + comunicado.prioridad.slice(1);
                prioridadBadge.className = `badge ${getPrioridadBadgeClass(comunicado.prioridad)}`;

                // Badge de estado
                const estadoBadge = document.getElementById('viewComunicadoEstado');
                estadoBadge.textContent = comunicado.estado_calculado.charAt(0).toUpperCase() + comunicado.estado_calculado.slice(1);
                estadoBadge.className = `badge ${getEstadoBadgeClass(comunicado.estado_calculado)}`;

                document.getElementById('verComunicadoModal').dataset.comunicadoId = comunicado.id_comunicado;
                bsViewModal.show();
            } else {
                NotificationModule.showError(data.message || 'Error al cargar el comunicado.');
            }
        } catch (error) {
            NotificationModule.showError('Error de red al cargar el comunicado.');
        }
    };

    // Editar un comunicado
    const editComunicado = async (id) => {
        try {
            const response = await fetch(`../controller/getComunicadoById.php?id=${id}`);
            const data = await response.json();

            if (data.success && data.comunicado) {
                const comunicado = data.comunicado;

                document.getElementById('editComunicadoId').value = comunicado.id_comunicado;
                document.getElementById('editarTitulo').value = comunicado.titulo;
                document.getElementById('editarContenido').value = comunicado.contenido;
                document.getElementById('editarPrioridad').value = comunicado.prioridad;

                if (document.getElementById('editarEstado')) {
                    document.getElementById('editarEstado').value = comunicado.estado_calculado;
                }

                const fechaExpiracionInput = document.getElementById('editarFechaExpiracion');
                if (fechaExpiracionInput) {
                    fechaExpiracionInput.value = comunicado.fecha_expiracion ? comunicado.fecha_expiracion.split(' ')[0] : '';
                }

                bsEditModal.show();
            } else {
                NotificationModule.showError(data.message || 'Error al cargar el comunicado para edición.');
            }
        } catch (error) {
            NotificationModule.showError('Error al cargar el comunicado para edición.');
        }
    };

    return {
        init,
        viewComunicado,
        editComunicado,
        loadComunicados,
        loadMainComunicado
    };
})();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    ComunicadosModule.init();
});

// Hacer accesible globalmente
window.ComunicadosModule = ComunicadosModule;