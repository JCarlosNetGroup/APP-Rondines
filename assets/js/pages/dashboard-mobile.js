document.addEventListener('DOMContentLoaded', function () {
    // Elementos del DOM
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const menuItems = document.querySelectorAll('.mobile-menu-item');
    const comunicadosContainer = document.getElementById('comunicados-container');
    const mainComunicadoCard = document.querySelector('.comunicado.card'); // Referencia a la tarjeta del comunicado principal

    // Variables de estado
    let isLoading = false;
    let allComunicados = []; // Almacena todos los comunicados vigentes cargados
    let currentPage = 1;
    let mainComunicadoId = null; // Para almacenar el ID del comunicado importante principal

    // Inicializar modal
    const comunicadoModal = new bootstrap.Modal(document.getElementById('comunicadoModal'));

    // Centinela para lazy loading
    const sentinel = document.createElement('div');
    sentinel.className = 'my-0';
    sentinel.id = 'loading-sentinel';

    // Carga inicial: primero carga el comunicado importante principal
    loadMainImportantComunicado();

    // Configurar Intersection Observer para lazy loading
    const observer = new IntersectionObserver(handleIntersection, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    });

    const getEstadoBadgeClass = (estado) => {
        switch (estado.toLowerCase()) {
            case 'vigente':
                return 'bg-success';
            case 'expirado':
                return 'bg-secondary';
            default:
                return 'bg-info';
        }
    };

    const getPrioridadBadgeClass = (prioridad) => {
        switch (prioridad.toLowerCase()) {
            case 'importante':
                return 'bg-prioridad-importante';
            case 'medio':
                return 'bg-prioridad-medio';
            default:
                return 'bg-info';
        }
    };

    /**
     * Carga el comunicado importante más reciente para la sección principal.
     */
    function loadMainImportantComunicado() {
        // Hacemos una petición para obtener solo el comunicado más reciente y marcado como "importante" y "vigente".
        fetch(`../controller/getComunicados.php?page=1&prioridad=importante&estado=vigente&limit=1`)
            .then(response => {
                if (!response.ok) throw new Error('Error en la red al cargar el comunicado principal');
                return response.json();
            })
            .then(data => {
                if (data && data.comunicados && data.comunicados.length > 0) {
                    const importantComunicado = data.comunicados[0];
                    updateMainComunicado(importantComunicado);
                    mainComunicadoId = importantComunicado.id_comunicado; // Guardamos el ID del comunicado principal
                } else {
                    // Si no se encuentra un comunicado importante, ocultamos la tarjeta principal
                    mainComunicadoCard.style.display = 'none';
                    document.querySelector('.divider-sections').textContent = 'Comunicados'; // Ajusta el título de la sección
                }
                loadComunicados(); // Después de manejar el principal, carga los otros comunicados
            })
            .catch(error => {
                console.error('Error al cargar el comunicado principal:', error);
                mainComunicadoCard.style.display = 'none'; // Ocultar si hay error
                document.querySelector('.divider-sections').textContent = 'Comunicados'; // Ajusta el título de la sección
                loadComunicados(); // Aun así, intenta cargar los otros comunicados
            });
    }

    /**
     * Carga los comunicados adicionales para la sección de "Novedades".
     */
    function loadComunicados() {
        if (isLoading) return;
        isLoading = true;

        // Mostrar spinner solo si es la primera carga general y no se ha mostrado un comunicado principal
        if (currentPage === 1 && !mainComunicadoId) {
            comunicadosContainer.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></div>';
        }

        // Petición para obtener comunicados vigentes
        fetch(`../controller/getComunicados.php?page=${currentPage}&estado=vigente`)
            .then(response => {
                if (!response.ok) throw new Error('Error en la red al cargar los comunicados adicionales');
                return response.json();
            })
            .then(data => {
                if (!data || !data.comunicados) throw new Error('Datos no válidos para comunicados adicionales');

                const comunicadosVigentes = data.comunicados.filter(comunicado =>
                    comunicado.estado_calculado.toLowerCase() === 'vigente' &&
                    comunicado.id_comunicado !== mainComunicadoId // Excluir el comunicado principal si ya se mostró
                );

                allComunicados = [...allComunicados, ...comunicadosVigentes];

                // Limpia el contenedor solo si es la primera página y no se mostró un comunicado principal inicialmente
                if (currentPage === 1 && !mainComunicadoId) {
                    comunicadosContainer.innerHTML = '';
                } else if (currentPage === 1 && mainComunicadoId && comunicadosContainer.children.length > 0 && comunicadosContainer.children[0].classList.contains('spinner-border')) {
                    // Si el comunicado principal se mostró, limpia el spinner inicial para 'Novedades'
                    comunicadosContainer.innerHTML = '';
                }

                if (comunicadosVigentes.length > 0) {
                    renderComunicados(comunicadosVigentes);
                    currentPage++;
                    addSentinel();
                } else if (currentPage === 1 && !mainComunicadoId) { // Si no hay comunicado principal y tampoco otros
                    showNoComunicadosMessage();
                } else {
                    removeSentinel();
                }

                isLoading = false;
            })
            .catch(error => {
                console.error('Error:', error);
                isLoading = false;
                if (currentPage === 1 && !mainComunicadoId) {
                    showErrorMessage(error.message || 'Error al cargar los comunicados');
                }
            });
    }

    function addSentinel() {
        if (!document.getElementById('loading-sentinel')) {
            comunicadosContainer.appendChild(sentinel);
            observer.observe(sentinel);
        }
    }

    function removeSentinel() {
        if (document.getElementById('loading-sentinel')) {
            observer.unobserve(sentinel);
            sentinel.remove();
        }
    }

    function handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isLoading) {
                loadComunicados();
            }
        });
    }

    function showNoComunicadosMessage() {
        mainComunicadoCard.style.display = 'none'; // Asegura que la tarjeta principal esté oculta si no hay comunicados
        comunicadosContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-info-circle fs-1 text-muted"></i>
                <p class="mt-2 text-muted">No hay comunicados disponibles</p>
            </div>`;
        document.querySelector('.divider-sections').textContent = 'No hay comunicados'; // Ajusta el título de la sección
    }

    function showErrorMessage(message) {
        mainComunicadoCard.style.display = 'none'; // Oculta la tarjeta principal en caso de error
        comunicadosContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-exclamation-triangle fs-1 text-danger"></i>
                <p class="mt-2 text-danger">${message}</p>
                <button class="btn btn-sm btn-outline-primary mt-2" onclick="location.reload()">
                    Reintentar
                </button>
            </div>`;
    }

    /**
     * Actualiza la sección principal del comunicado con los datos proporcionados.
     * @param {object} comunicado - Objeto del comunicado a mostrar.
     */
    function updateMainComunicado(comunicado) {
        if (!mainComunicadoCard) return;

        mainComunicadoCard.style.display = 'block'; // Asegúrate de que sea visible
        mainComunicadoCard.setAttribute('data-id', comunicado.id_comunicado);
        mainComunicadoCard.style.cursor = 'pointer';

        mainComunicadoCard.querySelector('.card-title').textContent = comunicado.titulo;

        const badgeContainer = mainComunicadoCard.querySelector('.badge-container');
        const estadoTexto = comunicado.estado_calculado.charAt(0).toUpperCase() + comunicado.estado_calculado.slice(1);
        const prioridadTexto = comunicado.prioridad.charAt(0).toUpperCase() + comunicado.prioridad.slice(1);

        badgeContainer.innerHTML = `
        <span class="badge ${getEstadoBadgeClass(comunicado.estado_calculado)} me-1">
            ${estadoTexto}
        </span>
        <span class="badge ${getPrioridadBadgeClass(comunicado.prioridad)}">
            ${prioridadTexto}
        </span>
        `;

        const descripcionElement = mainComunicadoCard.querySelector('.descripcion-comunicado');
        if (descripcionElement) {
            descripcionElement.textContent = comunicado.contenido;
            descripcionElement.style.whiteSpace = 'pre-line';
        }

        mainComunicadoCard.querySelector('.fecha-publicacion').textContent = formatDate(comunicado.fecha_publicacion);
        mainComunicadoCard.querySelector('.autor-comunicado span').textContent = comunicado.autor;

        // Añadir el event listener al comunicado principal
        mainComunicadoCard.addEventListener('click', function () {
            showComunicadoDetails(comunicado.id_comunicado);
        });
    }

    /**
     * Renderiza los comunicados en el contenedor de "Novedades".
     * @param {Array} comunicados - Array de objetos de comunicados a renderizar.
     */
    function renderComunicados(comunicados) {
        const fragment = document.createDocumentFragment();

        comunicados.forEach(comunicado => {
            const comunicadoElement = document.createElement('div');
            comunicadoElement.className = 'col-12 mt-1';

            const estadoTexto = comunicado.estado_calculado.charAt(0).toUpperCase() + comunicado.estado_calculado.slice(1);
            const prioridadTexto = comunicado.prioridad.charAt(0).toUpperCase() + comunicado.prioridad.slice(1);

            comunicadoElement.innerHTML = `
        <article class="comunicado card shadow-sm border-0" data-id="${comunicado.id_comunicado}" style="cursor: pointer;">
            <div class="card-body">
                <header class="d-flex flex-column align-items-start">
                    <h5 class="card-title h6 pb-1">${comunicado.titulo}</h5>
                    <div class="badge-container mb-2">
                        <span class="badge ${getEstadoBadgeClass(comunicado.estado_calculado)} me-1">
                            ${estadoTexto}
                        </span>
                        <span class="badge ${getPrioridadBadgeClass(comunicado.prioridad)}">
                            ${prioridadTexto}
                        </span>
                    </div>
                </header>

                <div class="contenido-comunicado py-2">
                    <div class="row">
                        <div class="col-12 d-flex flex-column align-items-start">
                            <p class="card-text descripcion-comunicado small" style="white-space: pre-line; text-align: left;">${comunicado.contenido.substring(0, 200)}${comunicado.contenido.length > 200 ? '...' : ''}</p>
                        </div>
                    </div>
                </div>

                <footer class="d-flex justify-content-between align-items-center pt-3 mt-3">
                    <div>
                        <span class="autor-comunicado text-muted small">Publicado por: <span class="fw-semibold px-1">${comunicado.autor}</span></span><br>
                        <span class="fechaComunicado text-muted small">Fecha de publicación: <span class="fw-semibold px-1">${formatDate(comunicado.fecha_publicacion)}</span></span>
                    </div>
                    <span class="text-primary">
                        <i class="bi bi-chevron-right"></i>
                    </span>
                </footer>
            </div>
        </article>
        `;
            fragment.appendChild(comunicadoElement);
        });

        comunicadosContainer.appendChild(fragment);

        // Añadir event listeners a todas las tarjetas recién renderizadas en el contenedor de "Novedades"
        document.querySelectorAll('#comunicados-container .comunicado.card').forEach(card => {
            card.addEventListener('click', function () {
                const id = parseInt(this.getAttribute('data-id'));
                showComunicadoDetails(id);
            });
        });
    }

    /**
     * Muestra los detalles completos de un comunicado en el modal.
     * @param {number} id - El ID del comunicado a mostrar.
     */
    function showComunicadoDetails(id) {
        // Busca el comunicado en allComunicados o verifica si es el principal
        const comunicado = allComunicados.find(c => c.id_comunicado === id) ||
                           (mainComunicadoId && id === mainComunicadoId ? allComunicados.find(c => c.id_comunicado === mainComunicadoId) : null);
        if (!comunicado || !comunicadoModal) return;

        document.getElementById('modalTitle').textContent = comunicado.titulo;
        const estadoTexto = comunicado.estado_calculado.charAt(0).toUpperCase() + comunicado.estado_calculado.slice(1);
        const prioridadTexto = comunicado.prioridad.charAt(0).toUpperCase() + comunicado.prioridad.slice(1);

        document.getElementById('modalBody').innerHTML = `
            <div class="mb-3 d-flex align-items-center">
                <span class="badge ${getEstadoBadgeClass(comunicado.estado_calculado)} me-2">
                    ${estadoTexto}
                </span>
                <span class="badge ${getPrioridadBadgeClass(comunicado.prioridad)}">
                    ${prioridadTexto}
                </span>
            </div>
            
            <p class="mb-2"><strong>Autor:</strong> ${comunicado.autor}</p>
            <p class="mb-2"><strong>Publicado:</strong> ${formatDate(comunicado.fecha_publicacion)}</p>
            
            ${comunicado.fecha_expiracion ?
                `<p class="mb-3"><strong>Válido hasta:</strong> ${formatDate(comunicado.fecha_expiracion)}</p>` : ''}
            
            <div class="comunicado-content mt-3" style="white-space: pre-line;">
                ${comunicado.contenido}
            </div>
        `;

        comunicadoModal.show();
    }

    /**
     * Formatea una cadena de fecha a un formato legible.
     * @param {string} dateString - La cadena de fecha a formatear.
     * @returns {string} La fecha formateada.
     */
    function formatDate(dateString) {
        if (!dateString) return '';

        // Se añade 'T00:00:00' para que Date trate la cadena como una fecha local y evite problemas de zona horaria
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    function toggleMenu() {
        document.body.classList.toggle('menu-open');
        mobileMenu.classList.toggle('show');
        menuOverlay.classList.toggle('show');
    }

    // Event listeners
    menuBtn.addEventListener('click', toggleMenu);
    menuOverlay.addEventListener('click', toggleMenu);

    menuItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleMenu();
            setTimeout(() => {
                window.location.href = this.getAttribute('href');
            }, 200);
        });
    });
});