// =============================================
// * MÓDULO DE VISUALIZACIÓN MÓVIL CON LAZY LOADING
// =============================================
document.addEventListener('DOMContentLoaded', function () {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const menuItems = document.querySelectorAll('.mobile-menu-item');
    
    // Variables para lazy loading
    let currentPage = 1;
    let isLoading = false;
    let hasMore = true;
    const comunicadosContainer = document.getElementById('comunicados-container');
    
    // Cargar comunicado principal y primeros comunicados
    loadInitialComunicados();
    
    // Configurar Intersection Observer para lazy loading
    const observer = new IntersectionObserver(handleIntersection, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    });
    
    // Observar el elemento centinela
    const sentinel = document.createElement('div');
    sentinel.id = 'loading-sentinel';
    comunicadosContainer.appendChild(sentinel);
    observer.observe(sentinel);

    // Función para cargar los comunicados iniciales
    function loadInitialComunicados() {
        fetch('../controller/getComunicados.php?page=1')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Actualizar comunicado principal con el más reciente
                    if (data.comunicados.length > 0) {
                        updateMainComunicado(data.comunicados[0]);
                        // Mostrar los siguientes comunicados (sin el primero)
                        renderComunicados(data.comunicados.slice(1));
                    }
                    currentPage = 1;
                    hasMore = currentPage < data.pagination.totalPages;
                } else {
                    console.error(data.message);
                }
            })
            .catch(error => console.error('Error:', error));
    }

    // Función para manejar la intersección (lazy loading)
    function handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isLoading && hasMore) {
                loadMoreComunicados();
            }
        });
    }

    // Función para cargar más comunicados
    function loadMoreComunicados() {
        isLoading = true;
        currentPage++;
        
        // Mostrar indicador de carga
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'col-12 text-center py-3';
        loadingIndicator.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>';
        comunicadosContainer.appendChild(loadingIndicator);
        
        fetch(`../controller/getComunicados.php?page=${currentPage}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Eliminar indicador de carga
                    comunicadosContainer.removeChild(loadingIndicator);
                    
                    // Renderizar nuevos comunicados
                    renderComunicados(data.comunicados);
                    
                    hasMore = currentPage < data.pagination.totalPages;
                    
                    // Si no hay más páginas, dejar de observar
                    if (!hasMore) {
                        observer.unobserve(sentinel);
                        sentinel.remove();
                    }
                } else {
                    console.error(data.message);
                }
                isLoading = false;
            })
            .catch(error => {
                console.error('Error:', error);
                isLoading = false;
            });
    }

    // Función para actualizar el comunicado principal
    function updateMainComunicado(comunicado) {
        const mainComunicado = document.querySelector('.comunicado.card');
        if (mainComunicado) {
            mainComunicado.querySelector('.card-title').textContent = comunicado.titulo;
            mainComunicado.querySelector('.descripcion-comunicado').textContent =
                comunicado.descripcion.substring(0, 150) + (comunicado.descripcion.length > 150 ? '...' : '');
            mainComunicado.querySelector('.fechaComunicado span').textContent = formatDate(comunicado.fecha);

            // Actualizar imagen desde ruta_archivo
            const imgElement = mainComunicado.querySelector('img');
            if (comunicado.ruta_archivo) {
                imgElement.src = comunicado.ruta_archivo;
                imgElement.style.display = 'block';
            } else {
                imgElement.style.display = 'none';
            }
        }
    }

    // Función para renderizar los comunicados
    function renderComunicados(comunicados) {
        comunicados.forEach(comunicado => {
            const comunicadoElement = document.createElement('div');
            comunicadoElement.className = 'col-12';
            comunicadoElement.innerHTML = `
                <article class="comunicado card h-100 shadow-sm border-0">
                    <div class="card-body">
                        <h5 class="card-title fs-6">${comunicado.titulo}</h5>
                        ${comunicado.ruta_archivo ? 
                            `<img src="${comunicado.ruta_archivo}" 
                                  class="img-fluid rounded mb-2 lazy" 
                                  style="max-height: 150px; object-fit: cover;"
                                  loading="lazy">` : ''}
                        <p class="card-text descripcion-comunicado small text-muted">
                            ${comunicado.descripcion.substring(0, 100)}${comunicado.descripcion.length > 100 ? '...' : ''}
                        </p>
                    </div>
                    <div class="card-footer bg-transparent border-0 pt-0">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="fecha-comunicado small text-muted">
                                Publicado: ${formatDate(comunicado.fecha)}
                            </span>
                        </div>
                    </div>
                </article>
            `;
            comunicadosContainer.insertBefore(comunicadoElement, sentinel);
        });
    }

    // Función para formatear la fecha
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

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
            e.stopPropagation();
            closeMenu();
            setTimeout(() => {
                window.location.href = this.getAttribute('href');
            }, 200);
        });
    });
});