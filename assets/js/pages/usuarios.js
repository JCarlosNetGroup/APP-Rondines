window.onload = function () {
    // Inicialización de funciones al cargar la página
    fetchData();
    inicializarFormularioEditar();
    inicializarFormularioAgregar();
    
    // Evento de búsqueda en tiempo real con debounce
    const inputBusqueda = document.getElementById('inputBusqueda');
    const selectEstado = document.getElementById('selectEstado');
    
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', debounce(function (e) {
            const estado = selectEstado ? selectEstado.value : '';
            fetchData(e.target.value, estado);
        }, 200));
    }
    
    if (selectEstado) {
        selectEstado.addEventListener('change', function (e) {
            const searchTerm = inputBusqueda ? inputBusqueda.value : '';
            fetchData(searchTerm, e.target.value);
        });
    }
};

// Función debounce para limitar la frecuencia de ejecución
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

// Función para inicializar el formulario de agregar usuario
function inicializarFormularioAgregar() {
    const formAgregarUsuario = document.querySelector("#formAddUser");
    const modalAddUser = document.getElementById('addUser');

    if (formAgregarUsuario && modalAddUser) {
        const bsModal = new bootstrap.Modal(modalAddUser);

        // Resetear formulario al mostrar el modal
        modalAddUser.addEventListener('show.bs.modal', () => {
            formAgregarUsuario.reset();
        });

        // Manejar envío del formulario
        formAgregarUsuario.addEventListener("submit", async function (event) {
            event.preventDefault();
            const submitBtn = formAgregarUsuario.querySelector('button[type="submit"]');
            submitBtn.disabled = true;

            try {
                const formData = new FormData(this);
                const response = await fetch('../controller/addUser.php', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.text();

                if (data.includes('correctamente')) {
                    bsModal.hide();
                    formAgregarUsuario.reset();
                    fetchData();
                } else {
                    console.error('Error al agregar usuario:', data);
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                submitBtn.disabled = false;
            }
        });
    }
}

// Función para inicializar el formulario de editar usuario
function inicializarFormularioEditar() {
    const formEditarUsuario = document.querySelector("#formEditarUsuario");
    
    if (formEditarUsuario) {
        formEditarUsuario.addEventListener("submit", function (event) {
            event.preventDefault();
            const formData = new FormData(this);

            fetch('../controller/updateUser.php', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                return response.text().then(text => {
                    try {
                        return JSON.parse(text);
                    } catch (e) {
                        console.error('Respuesta no JSON:', text);
                        throw new Error('La respuesta del servidor no es válida');
                    }
                });
            })
            .then(data => {
                if (data.success) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('editUser'));
                    modal.hide();
                    fetchData();
                } else {
                    console.error('Error al actualizar el usuario:', data.error || 'Error desconocido');
                }
            })
            .catch(error => {
                console.error('Error al enviar la petición de actualización:', error);
            });
        });
    }
}

// Función para obtener y mostrar datos de la tabla
function fetchData(searchTerm = '', estado = '') {
    let url = `../controller/TableUsers.php`;
    const params = new URLSearchParams();
    
    if (searchTerm) params.append('search', searchTerm);
    if (estado) params.append('estado', estado);
    
    if (params.toString()) url += `?${params.toString()}`;

    fetch(url)
        .then((response) => response.json())
        .then((response) => {
            const tableBody = document.querySelector("#data-table tbody");
            tableBody.innerHTML = "";

            response.data.forEach((row) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${row.id_empleado}</td>
                    <td>${row.nombre}</td>
                    <td>${row.apellido}</td>
                    <td>${row.telefono}</td>
                    <td>${row.nombre_rol}</td>
                    <td>${row.estado}</td>
                    <td>
                        <a class="edit" data-bs-toggle="modal" data-bs-target="#editUser"
                            data-user-id="${row.id_empleado}"
                            data-user-nombre="${row.nombre}"
                            data-user-apellido="${row.apellido}"
                            data-user-puesto="${row.puesto}"
                            data-user-telefono="${row.telefono}"
                            data-user-estado="${row.estado}"
                            data-user-rol-id="${row.id_rol}"
                            data-user-usuario="${row.usuario}"
                            data-user-contrasena="${row.contrasena}">
                            <i class="bi bi-pencil-square"></i>
                        </a>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
            
            addEventListenersToEditButtons();
        })
        .catch((error) => console.error("Error al obtener los datos:", error));
}

// Función para agregar eventos a los botones de edición
function addEventListenersToEditButtons() {
    const editButtons = document.querySelectorAll(".edit");

    editButtons.forEach(button => {
        button.addEventListener("click", function () {
            // Obtener elementos del modal
            const modalElements = {
                nombre: document.querySelector("#editarNombre"),
                apellido: document.querySelector("#editarApellido"),
                puesto: document.querySelector("#editarPuesto"),
                telefono: document.querySelector("#editarTelefono"),
                estado: document.querySelector("#editarEstado"),
                rol: document.querySelector("#editarRol"),
                id: document.querySelector("#editarIdEmpleado"),
                usuario: document.querySelector("#editarUsuario"),
                contrasena: document.querySelector("#editarContrasena")
            };

            // Llenar el formulario con los datos del usuario
            modalElements.id.value = this.getAttribute('data-user-id');
            modalElements.nombre.value = this.getAttribute('data-user-nombre');
            modalElements.apellido.value = this.getAttribute('data-user-apellido');
            modalElements.puesto.value = this.getAttribute('data-user-puesto');
            modalElements.telefono.value = this.getAttribute('data-user-telefono');
            modalElements.usuario.value = this.getAttribute('data-user-usuario');
            modalElements.contrasena.value = this.getAttribute('data-user-contrasena');

            // Establecer estado y rol
            const estado = this.getAttribute('data-user-estado');
            const rolId = this.getAttribute('data-user-rol-id');
            
            if (estado) modalElements.estado.value = estado.toLowerCase();
            if (rolId && modalElements.rol) modalElements.rol.value = rolId;
        });
    });
}