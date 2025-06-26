document.addEventListener('DOMContentLoaded', init);

// Variables globales para el estado
let currentPage = 1;
let itemsPerPage;
let totalRecords = 0;
let currentFilters = {
    search: '',
    fechaInicio: '',
    fechaFin: ''
};

//* Función de entrada principal
function init() {
    try {
        // Inicializar itemsPerPage desde el valor seleccionado por defecto
        const itemsPerPageSelect = document.getElementById('itemsPerPageSelect');
        itemsPerPage = parseInt(itemsPerPageSelect.value);

        fetchTableReports();
        setupSearch();
        setupModalDetails();
        setupDateFilters();
        setupItemsPerPageChange();
        setupExcelExport();
    } catch (error) {
        console.error('Error en inicialización:', error);
        showErrorAlert();
    }
}

//* Configura los filtros por fecha
function setupDateFilters() {
    const btnFiltrar = document.getElementById('btnFiltrar');
    const btnLimpiar = document.getElementById('btnLimpiar');
    const fechaInicio = document.getElementById('fechaInicio');
    const fechaFin = document.getElementById('fechaFin');

    btnFiltrar.addEventListener('click', function () {
        currentFilters.fechaInicio = fechaInicio.value;
        currentFilters.fechaFin = fechaFin.value;
        currentPage = 1;
        fetchTableReports();
        
        // Mostrar botón de limpiar si hay filtros aplicados
        if (currentFilters.fechaInicio || currentFilters.fechaFin) {
            btnLimpiar.classList.remove('d-none');
        }
    });

    btnLimpiar.addEventListener('click', function () {
        fechaInicio.value = '';
        fechaFin.value = '';
        currentFilters.fechaInicio = '';
        currentFilters.fechaFin = '';
        currentPage = 1;
        fetchTableReports();
        btnLimpiar.classList.add('d-none');
    });
}

//* Configuración del control de búsqueda
function setupSearch() {
    const inputBusqueda = document.getElementById('inputBusqueda');

    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', debounce(function (e) {
            currentFilters.search = e.target.value.trim();
            currentPage = 1;
            fetchTableReports();
        }, 300));
    }
}

//* Configura el cambio en el número de elementos por página
function setupItemsPerPageChange() {
    const itemsPerPageSelect = document.getElementById('itemsPerPageSelect');
    itemsPerPageSelect.addEventListener('change', function (e) {
        itemsPerPage = parseInt(e.target.value); 
        currentPage = 1;
        fetchTableReports();
    });
}

//* Función que obtiene los registros del servidor con filtros
function fetchTableReports() {
    let url = `../controller/tableReports.php`;
    const params = new URLSearchParams();

    if (currentFilters.search) params.append('search', currentFilters.search);
    if (currentFilters.fechaInicio) params.append('fecha_inicio', currentFilters.fechaInicio);
    if (currentFilters.fechaFin) params.append('fecha_fin', currentFilters.fechaFin);

    params.append('page', currentPage);
    params.append('itemsPerPage', itemsPerPage);

    url += `?${params.toString()}`;

    fetch(url)
        .then((response) => response.json())
        .then((response) => {
            if (!response.success) {
                throw new Error(response.message || 'Error desconocido al obtener datos.');
            }
            if (!response.data) {
                throw new Error('Datos no recibidos');
            }

            totalRecords = response.totalRegistros || 0;
            const tableBody = document.querySelector("#data-table tbody");
            const fragment = document.createDocumentFragment();

            if (response.data.length === 0) {
                const tr = document.createElement("tr");
                const td = document.createElement("td");
                td.colSpan = 9;
                td.className = "text-center py-4";
                td.textContent = "No se encontraron registros con los filtros aplicados";
                tr.appendChild(td);
                fragment.appendChild(tr);
            } else {
                response.data.forEach((row) => {
                    const tr = document.createElement("tr");

                    const createCell = (value) => {
                        const td = document.createElement("td");
                        td.textContent = value;
                        return td;
                    };

                    tr.appendChild(createCell(row.id_reporte));
                    tr.appendChild(createCell(row.Rondin));
                    tr.appendChild(createCell(row.Guardia));
                    tr.appendChild(createCell(row.Ubicacion));
                    tr.appendChild(createCell(row.Orden));

                    const observacionCell = document.createElement("td");
                    const observacionText = row.observacion || 'Sin observación';
                    observacionCell.textContent = observacionText.length > 50 ?
                        observacionText.substring(0, 50) + '...' : observacionText;
                    observacionCell.title = observacionText;
                    tr.appendChild(observacionCell);

                    const fechaCell = document.createElement("td");
                    const fecha = new Date(row.fecha);
                    fechaCell.textContent = fecha.toLocaleString();
                    tr.appendChild(fechaCell);

                    const incidenciaCell = document.createElement("td");
                    incidenciaCell.textContent = row.Incidencia;
                    if (row.Incidencia > 0) {
                        incidenciaCell.className = 'text-danger fw-bold';
                    }
                    tr.appendChild(incidenciaCell);

                    const actionsTd = document.createElement("td");
                    const detailsLink = document.createElement("a");
                    detailsLink.className = "view";
                    detailsLink.setAttribute("data-bs-toggle", "modal");
                    detailsLink.setAttribute("data-bs-target", "#viewReport");

                    detailsLink.setAttribute("data-reporte-id", row.id_reporte);
                    detailsLink.setAttribute("data-reporte-guardia", row.Guardia);
                    detailsLink.setAttribute("data-reporte-observacion", row.observacion || 'Sin observación');
                    detailsLink.setAttribute("data-reporte-fecha", fecha.toLocaleString());
                    detailsLink.setAttribute("data-reporte-incidencia", row.Incidencia);

                    const icon = document.createElement("i");
                    icon.className = "bi bi-file-text";
                    detailsLink.appendChild(icon);
                    actionsTd.appendChild(detailsLink);
                    tr.appendChild(actionsTd);
                    fragment.appendChild(tr);
                });
            }

            tableBody.innerHTML = "";
            tableBody.appendChild(fragment);

            updatePagination();
        })
        .catch((error) => {
            console.error("Error al obtener los datos:", error);
            showError("Error al cargar los datos de reportes");
        });
}

//* Actualiza los controles de paginación
function updatePagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const totalPages = Math.ceil(totalRecords / itemsPerPage);

    if (totalPages <= 1 && totalRecords > 0) {
        const pageLi = document.createElement('li');
        pageLi.className = 'page-item active';
        const pageLink = document.createElement('a');
        pageLink.className = 'page-link';
        pageLink.href = '#';
        pageLink.textContent = '1';
        pageLi.appendChild(pageLink);
        pagination.appendChild(pageLi);
        return;
    } else if (totalRecords === 0) {
        return;
    }

    // Botón Anterior
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    const prevLink = document.createElement('a');
    prevLink.className = 'page-link';
    prevLink.href = '#';
    prevLink.textContent = 'Anterior';
    prevLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            fetchTableReports();
        }
    });
    prevLi.appendChild(prevLink);
    pagination.appendChild(prevLi);

    // Números de página
    const maxVisiblePages = 5;
    let startPage, endPage;

    if (totalPages <= maxVisiblePages) {
        startPage = 1;
        endPage = totalPages;
    } else {
        const maxPagesBeforeCurrent = Math.floor(maxVisiblePages / 2);
        const maxPagesAfterCurrent = Math.ceil(maxVisiblePages / 2) - 1;

        if (currentPage <= maxPagesBeforeCurrent) {
            startPage = 1;
            endPage = maxVisiblePages;
        } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
            startPage = totalPages - maxVisiblePages + 1;
            endPage = totalPages;
        } else {
            startPage = currentPage - maxPagesBeforeCurrent;
            endPage = currentPage + maxPagesAfterCurrent;
        }
    }

    // Puntos suspensivos al inicio si es necesario
    if (startPage > 1) {
        const dotsLi = document.createElement('li');
        dotsLi.className = 'page-item disabled';
        const dotsLink = document.createElement('a');
        dotsLink.className = 'page-link';
        dotsLink.textContent = '...';
        dotsLi.appendChild(dotsLink);
        pagination.appendChild(dotsLi);
    }

    // Páginas
    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        const pageLink = document.createElement('a');
        pageLink.className = 'page-link';
        pageLink.href = '#';
        pageLink.textContent = i;
        pageLink.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = i;
            fetchTableReports();
        });
        pageLi.appendChild(pageLink);
        pagination.appendChild(pageLi);
    }

    // Puntos suspensivos al final si es necesario
    if (endPage < totalPages) {
        const dotsLi = document.createElement('li');
        dotsLi.className = 'page-item disabled';
        const dotsLink = document.createElement('a');
        dotsLink.className = 'page-link';
        dotsLink.textContent = '...';
        dotsLi.appendChild(dotsLink);
        pagination.appendChild(dotsLi);
    }

    // Botón Siguiente
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    const nextLink = document.createElement('a');
    nextLink.className = 'page-link';
    nextLink.href = '#';
    nextLink.textContent = 'Siguiente';
    nextLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            fetchTableReports();
        }
    });
    nextLi.appendChild(nextLink);
    pagination.appendChild(nextLi);
}

//* Configura el modal de detalles
function setupModalDetails() {
    const modal = document.getElementById('viewReport');

    if (modal) {
        modal.addEventListener('show.bs.modal', async function (event) {
            const button = event.relatedTarget;
            if (!button) return;

            const reportId = button.getAttribute('data-reporte-id');
            
            // Limpiar contenidos previos
            document.getElementById('report-images-container').innerHTML = '';
            document.getElementById('incidencias-accordion').innerHTML = '';
            document.getElementById('incidencias-section').classList.add('d-none');

            // Mostrar información básica
            document.getElementById('detail-id').textContent = reportId;
            document.getElementById('detail-guardia').textContent = button.getAttribute('data-reporte-guardia');
            document.getElementById('detail-observacion').textContent = button.getAttribute('data-reporte-observacion');
            document.getElementById('detail-fecha').textContent = button.getAttribute('data-reporte-fecha');

            const incidencias = parseInt(button.getAttribute('data-reporte-incidencia'));
            const incidenciaBadge = document.getElementById('detail-incidencia');
            incidenciaBadge.textContent = incidencias;
            incidenciaBadge.className = incidencias > 0 ? 'badge bg-danger' : 'badge bg-success';

            try {
                // Obtener imágenes del reporte
                const reportImages = await fetchReportImages(reportId);
                displayReportImages(reportImages);

                // Si hay incidencias, obtener sus detalles
                if (incidencias > 0) {
                    const incidenciasData = await fetchIncidenciasDetails(reportId);
                    displayIncidenciasDetails(incidenciasData);
                    document.getElementById('incidencias-section').classList.remove('d-none');
                }
            } catch (error) {
                console.error('Error al cargar detalles adicionales:', error);
                showError('No se pudieron cargar las imágenes e incidencias');
            }
        });
    }
}

//* Obtener imágenes del reporte desde el servidor
async function fetchReportImages(reportId) {
    const response = await fetch(`../controller/getReportImages.php?id_reporte=${reportId}`);
    if (!response.ok) throw new Error('Error al obtener imágenes');
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Error en los datos');
    return data.images || [];
}

//* Mostrar imágenes del reporte
function displayReportImages(images) {
    const container = document.getElementById('report-images-container');
    
    if (images.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-muted">No hay imágenes para este reporte</p></div>';
        return;
    }

    images.forEach(image => {
        const col = document.createElement('div');
        col.className = 'col-md-4 col-6';
        
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'ratio ratio-1x1';
        
        const img = document.createElement('img');
        img.src = `../assets/imagesReport/${image}`;
        img.className = 'img-thumbnail object-fit-cover cursor-pointer';
        img.alt = 'Foto del reporte';
        img.style.cursor = 'pointer';
        img.loading = 'lazy';
        
        img.addEventListener('click', () => {
            Swal.fire({
                imageUrl: `../assets/imagesReport/${image}`,
                imageAlt: 'Foto del reporte',
                showConfirmButton: false,
                background: 'transparent',
                backdrop: 'rgba(0,0,0,0.9)',
                showCloseButton: true
            });
        });
        
        imgWrapper.appendChild(img);
        col.appendChild(imgWrapper);
        container.appendChild(col);
    });
}

//* Obtener detalles de incidencias desde el servidor
async function fetchIncidenciasDetails(reportId) {
    const response = await fetch(`../controller/getIncidenciasDetails.php?id_reporte=${reportId}`);
    if (!response.ok) throw new Error('Error al obtener incidencias');
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Error en los datos');
    return data.incidencias || [];
}

//* Mostrar detalles de incidencias
function displayIncidenciasDetails(incidencias) {
    const accordion = document.getElementById('incidencias-accordion');
    
    incidencias.forEach((incidencia) => {
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item mb-2';
        
        const accordionHeader = document.createElement('h2');
        accordionHeader.className = 'accordion-header';
        accordionHeader.id = `incidencia-heading-${incidencia.id_incidencia}`;
        
        const accordionButton = document.createElement('button');
        accordionButton.className = 'accordion-button collapsed';
        accordionButton.type = 'button';
        accordionButton.setAttribute('data-bs-toggle', 'collapse');
        accordionButton.setAttribute('data-bs-target', `#incidencia-collapse-${incidencia.id_incidencia}`);
        accordionButton.innerHTML = `
            <div class="d-flex w-100 justify-content-between align-items-center px-1">
                <span class="me-3">Incidencia #${incidencia.id_incidencia}</span>
                <span class="badge ${getBadgeClassForGravedad(incidencia.riesgo)}">
                    ${incidencia.riesgo || 'Sin riesgo'}
                </span>
            </div>
        `;
        
        accordionHeader.appendChild(accordionButton);
        
        const accordionCollapse = document.createElement('div');
        accordionCollapse.id = `incidencia-collapse-${incidencia.id_incidencia}`;
        accordionCollapse.className = 'accordion-collapse collapse';
        accordionCollapse.setAttribute('aria-labelledby', `incidencia-heading-${incidencia.id_incidencia}`);
        
        const accordionBody = document.createElement('div');
        accordionBody.className = 'accordion-body';
        
        const infoHtml = `
            <div class="row">
                <div class="col-md-6">
                    <p><strong>Descripción:</strong></p>
                    <div class="card bg-light p-3 mb-3">
                        ${incidencia.descripcion || 'No hay descripción disponible'}
                    </div>
                </div>
                <div class="col-md-6">
                    <p><strong>Reportado por:</strong> ${incidencia.nombre_empleado || 'Desconocido'}</p>
                    <p><strong>Fecha:</strong> ${formatDateTime(incidencia.fecha)}</p>
                    <p><strong>Ubicación:</strong> ${incidencia.nombre_ubicacion || 'No especificada'}</p>
                </div>
            </div>
        `;
        accordionBody.innerHTML = infoHtml;
        
        // Mostrar imágenes si existen
        if (incidencia.imagenes && incidencia.imagenes.length > 0) {
            const imagesTitle = document.createElement('h6');
            imagesTitle.className = 'mt-3 mb-2 fw-bold';
            imagesTitle.textContent = 'Fotos de la Incidencia:';
            accordionBody.appendChild(imagesTitle);
            
            const imagesContainer = document.createElement('div');
            imagesContainer.className = 'row g-3';
            
            incidencia.imagenes.forEach(imagen => {
                const imgCol = document.createElement('div');
                imgCol.className = 'col-md-4 col-6';
                
                const imgWrapper = document.createElement('div');
                imgWrapper.className = 'ratio ratio-1x1';
                
                const img = document.createElement('img');
                img.src = `../assets/imagesIncidencias/${imagen}`;
                img.className = 'img-thumbnail object-fit-cover cursor-pointer';
                img.alt = 'Foto de incidencia';
                img.style.cursor = 'pointer';
                img.loading = 'lazy';
                
                img.addEventListener('click', () => {
                    Swal.fire({
                        imageUrl: `../assets/imagesIncidencias/${imagen}`,
                        imageAlt: 'Foto de incidencia',
                        showConfirmButton: false,
                        background: 'transparent',
                        backdrop: 'rgba(0,0,0,0.9)',
                        showCloseButton: true
                    });
                });
                
                imgWrapper.appendChild(img);
                imgCol.appendChild(imgWrapper);
                imagesContainer.appendChild(imgCol);
            });
            
            accordionBody.appendChild(imagesContainer);
        }
        
        accordionCollapse.appendChild(accordionBody);
        accordionItem.appendChild(accordionHeader);
        accordionItem.appendChild(accordionCollapse);
        accordion.appendChild(accordionItem);
    });
}

//* Función para formatear fecha
function formatDateTime(dateString) {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

//* Helper para obtener clase de badge según gravedad
function getBadgeClassForGravedad(riesgo) {
    if (!riesgo) return 'bg-secondary';
    riesgo = riesgo.toLowerCase();
    
    if (riesgo.includes('alto') || riesgo.includes('critico') || riesgo.includes('emergencia')) 
        return 'bg-danger';
    if (riesgo.includes('medio') || riesgo.includes('moderado') || riesgo.includes('intermedio')) 
        return 'bg-warning text-dark';
    if (riesgo.includes('bajo') || riesgo.includes('leve') || riesgo.includes('menor')) 
        return 'bg-primary';
    return 'bg-secondary';
}

//* Función debounce para limitar la frecuencia de ejecución
function debounce(func, wait) {
    let timeout;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

//* Configura el botón de exportación a Excel
function setupExcelExport() {
    const btnExportarExcel = document.getElementById('btnExportarExcel');
    
    btnExportarExcel.addEventListener('click', async function() {
        try {
            // Mostrar loading
            const loadingSwal = Swal.fire({
                title: 'Preparando archivo',
                html: 'Por favor espera mientras se generan los datos...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Obtener todos los datos con los filtros actuales
            const data = await fetchAllDataForExport();
            
            if (!data || data.length === 0) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'Sin datos',
                    text: 'No hay datos para exportar con los filtros actuales',
                    confirmButtonColor: '#3085d6'
                });
                return;
            }

            // Crear libro de Excel
            const wb = XLSX.utils.book_new();
            
            // Preparar los datos para la hoja de cálculo
            const excelData = data.map(item => ({
                'ID': item.id_reporte,
                'Rondín': item.Rondin,
                'Guardia': item.Guardia,
                'Ubicación': item.Ubicacion,
                'Orden': item.Orden,
                'Observación': item.observacion || 'Sin observación',
                'Fecha': new Date(item.fecha).toLocaleString(),
                'Incidencias': item.Incidencia
            }));

            const ws = XLSX.utils.json_to_sheet(excelData);
            
            // Ajustar el ancho de las columnas
            const wscols = [
                {wch: 8},  // ID
                {wch: 20}, // Rondín
                {wch: 25}, // Guardia
                {wch: 25}, // Ubicación
                {wch: 8},  // Orden
                {wch: 40}, // Observación
                {wch: 20}, // Fecha
                {wch: 12}  // Incidencias
            ];
            ws['!cols'] = wscols;
            
            XLSX.utils.book_append_sheet(wb, ws, "Reportes");

            // Generar nombre de archivo con fecha y filtros
            let fileName = 'Reportes_';
            
            if (currentFilters.fechaInicio || currentFilters.fechaFin) {
                fileName += `_${currentFilters.fechaInicio || 'inicio'}_a_${currentFilters.fechaFin || 'hoy'}`;
            }
            
            if (currentFilters.search) {
                fileName += `_busqueda_${currentFilters.search.substring(0, 10)}`;
            }
            
            fileName += `_${new Date().toISOString().slice(0, 10)}.xlsx`;

            // Cerrar loading
            await loadingSwal.close();
            
            // Exportar el archivo
            XLSX.writeFile(wb, fileName);
            
        } catch (error) {
            console.error('Error al exportar a Excel:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al generar el archivo Excel',
                confirmButtonColor: '#d33'
            });
        }
    });
}

//* Obtiene todos los datos para exportar (con los filtros aplicados)
async function fetchAllDataForExport() {
    let url = `../controller/tableReports.php`;
    const params = new URLSearchParams();

    if (currentFilters.search) params.append('search', currentFilters.search);
    if (currentFilters.fechaInicio) params.append('fecha_inicio', currentFilters.fechaInicio);
    if (currentFilters.fechaFin) params.append('fecha_fin', currentFilters.fechaFin);
    
    // Forzar a obtener todos los registros sin paginación
    params.append('page', 1);
    params.append('itemsPerPage', 1000000); // Un número muy grande para obtener todos

    url += `?${params.toString()}`;

    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.success) {
        throw new Error(data.message || 'Error al obtener datos para exportar');
    }
    
    return data.data || [];
}

//* Muestra una alerta de error con opción para recargar la página
function showErrorAlert() {
    Swal.fire({
        title: 'Error',
        text: "Hubo un problema al cargar los datos.",
        icon: 'error',
        confirmButtonText: 'Recargar',
        allowOutsideClick: false,
    }).then((result) => {
        if (result.isConfirmed) {
            location.reload();
        }
    });
}

//* Muestra un mensaje de error
function showError(message) {
    return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonColor: '#d33'
    });
}