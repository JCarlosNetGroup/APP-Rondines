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


// Función para manejar el formulario de comunicados
function formComunicados() {
    const form = document.querySelector(".formulario");
    const modal = document.getElementById('miModal');

    if (form && modal) {
        const bsModal = new bootstrap.Modal(modal);

        // Resetea el formulario cada vez que se abre el modal
        modal.addEventListener('show.bs.modal', () => {
            form.reset();
            document.getElementById('previewNuevoArchivo').innerHTML = '';
        });

        // Maneja el envío del formulario
        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;

            try {
                const formData = new FormData(this);

                // Validar tamaño del archivo (ejemplo: máximo 5MB)
                const archivo = formData.get('archivo');
                if (archivo && archivo.size > 5 * 1024 * 1024) {
                    throw new Error('El archivo no debe exceder los 5MB');
                }

                // Envía los datos al servidor
                const response = await fetch('../controller/addComunicado.php', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();

                if (!data.success) throw new Error(data.message || 'Error al publicar el comunicado');

                // Muestra éxito, cierra modal y actualiza tabla
                await NotificationModule.showSuccess('Comunicado publicado correctamente');
                bsModal.hide();
                form.reset();
                
                // AQUÍ VA LA PARTE QUE PREGUNTASTE - ACTUALIZAR LA LISTA DE COMUNICADOS
                if (data.success) {
                    // Recargar la primera página para mostrar el nuevo comunicado
                    loadComunicados(1);
                    
                    // Opcional: También puedes mostrar el mensaje de éxito aquí si prefieres
                    // en lugar de usar NotificationModule
                    // alert(data.message);
                }

            } catch (error) {
                await NotificationModule.showError(error.message || 'Error al publicar el comunicado');
            } finally {
                submitBtn.disabled = false;
            }
        });
    }
}

// Llamar a la función cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    formComunicados();

    // Preview del archivo seleccionado
    document.getElementById('agregarArchivo').addEventListener('change', function (e) {
        const preview = document.getElementById('previewNuevoArchivo');
        preview.innerHTML = '';

        if (this.files && this.files[0]) {
            const file = this.files[0];
            const fileType = file.type.split('/')[0];

            if (fileType === 'image') {
                const reader = new FileReader();
                reader.onload = function (e) {
                    preview.innerHTML = `<img src="${e.target.result}" class="img-thumbnail" style="max-height: 150px;">`;
                }
                reader.readAsDataURL(file);
            } else {
                preview.innerHTML = `
                    <div class="alert alert-info p-2">
                        <i class="bi bi-file-earmark-text fs-4"></i>
                        <div>${file.name}<br><small>${(file.size / 1024).toFixed(2)} KB</small></div>
                    </div>
                `;
            }
        }
    });
});


document.addEventListener('DOMContentLoaded', function () {
    // Cargar comunicados al inicio
    loadComunicados(1);

    // Función para cargar comunicados
    function loadComunicados(page) {
        fetch('../controller/getComunicados.php?page=1')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    renderComunicados(data.comunicados);
                    renderPagination(data.pagination);
                } else {
                    console.error(data.message);
                }
            })
            .catch(error => console.error('Error:', error));
    }

    // Función para renderizar los comunicados
    function renderComunicados(comunicados) {
        const container = document.getElementById('comunicados-container');
        container.innerHTML = '';

        comunicados.forEach(comunicado => {
            const comunicadoElement = document.createElement('div');
            comunicadoElement.className = 'col-md-6 col-lg-4';
            comunicadoElement.innerHTML = `
                <article class="comunicado card h-100 shadow-sm border-0 hover-shadow">
                    <div class="card-body">
                        <h5 class="card-title fs-6">${comunicado.titulo}</h5>
                        <p class="card-text descripcion-comunicado small text-muted">${comunicado.descripcion.substring(0, 100)}${comunicado.descripcion.length > 100 ? '...' : ''}</p>
                    </div>
                    <div class="card-footer bg-transparent border-0 pt-0">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="fecha-comunicado small text-muted">Publicado: ${formatDate(comunicado.fecha)}</span>
                            <button class="btn btn-sm btn-outline-secondary" onclick="viewComunicado(${comunicado.id})">Ver</button>
                        </div>
                    </div>
                </article>
            `;
            container.appendChild(comunicadoElement);
        });
    }

    // Función para renderizar la paginación
    function renderPagination(pagination) {
        const container = document.getElementById('pagination-container');
        container.innerHTML = '';

        // Botón Anterior
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#" tabindex="-1">Anterior</a>`;
        prevLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (pagination.currentPage > 1) {
                loadComunicados(pagination.currentPage - 1);
            }
        });
        container.appendChild(prevLi);

        // Números de página
        for (let i = 1; i <= pagination.totalPages; i++) {
            const pageLi = document.createElement('li');
            pageLi.className = `page-item ${i === pagination.currentPage ? 'active' : ''}`;
            pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            pageLi.addEventListener('click', (e) => {
                e.preventDefault();
                loadComunicados(i);
            });
            container.appendChild(pageLi);
        }

        // Botón Siguiente
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#">Siguiente</a>`;
        nextLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (pagination.currentPage < pagination.totalPages) {
                loadComunicados(pagination.currentPage + 1);
            }
        });
        container.appendChild(nextLi);
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
});

// Función para ver un comunicado (puedes implementar un modal o página de detalle)
function viewComunicado(id) {
    // Aquí puedes implementar cómo mostrar el comunicado completo
    console.log('Ver comunicado:', id);
    // Ejemplo: window.location.href = `verComunicado.php?id=${id}`;
}