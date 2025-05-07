//* Funcion de entrada principal, se ejecuta al cargar el DOM

function init() {
    try {
        fetchTableLocations();
        formAddLocation();
        // formEditLocation();

    } catch (error) {
        console.error('Error en inicialización:', error);

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

}

document.addEventListener('DOMContentLoaded', init);


//* Funcion que obtiene los registros del servidor

function fetchTableLocations(searchTerm = '') {
    let url = `../controller/tableLocation.php`;
    const params = new URLSearchParams();

    if (searchTerm) params.append('search', searchTerm);
    if (params.toString()) url += `?${params.toString()}`;

    fetch(url)
        .then((response) => response.json())
        .then((response) => {

            const tableBody = document.querySelector("#data-table tbody");
            const fragment = document.createDocumentFragment();

            response.data.forEach((row) => {
                const tr = document.createElement("tr");

                // Función segura para crear celdas
                const createCell = (value) => {
                    const td = document.createElement("td");
                    td.textContent = value;
                    return td;
                };

                // Añadir celdas de datos
                tr.appendChild(createCell(row.id_ubicacion));
                tr.appendChild(createCell(row.nombre));
                tr.appendChild(createCell(row.latitud));
                tr.appendChild(createCell(row.longitud));
                tr.appendChild(createCell(row.estado));

                // Celda de acciones con botón de edición
                const actionsTd = document.createElement("td");
                const editLink = document.createElement("a");
                editLink.className = "edit";
                editLink.setAttribute("data-bs-toggle", "modal");
                editLink.setAttribute("data-bs-target", "#editUser");

                // Añadir atributos data- de forma segura
                const dataAttributes = {
                    'ubicacion-id': row.id_ubicacion,
                    'ubicacion-nombre': row.nombre,
                    'ubicacion-latitud': row.latitud,
                    'ubicacion-longitud': row.longitud,
                    'ubicacion-estado': row.estado,
                };

                Object.entries(dataAttributes).forEach(([key, value]) => {
                    editLink.setAttribute(`data-${key}`, value);
                });

                // Añadir icono de forma segura
                const icon = document.createElement("i");
                icon.className = "bi bi-pencil-square";
                editLink.appendChild(icon);

                actionsTd.appendChild(editLink);
                tr.appendChild(actionsTd);
                fragment.appendChild(tr);
            });

            // Actualización eficiente del DOM
            tableBody.innerHTML = "";
            tableBody.appendChild(fragment);

            // addEventListenersToEditButtons();
        })
        .catch((error) => {
            console.error("Error al obtener los datos:", error);
        });
}

//* Funcion que agrega un nuevo registro desde el modalAddLocation

function formAddLocation() {
    const formAddLocation = document.querySelector("#formAddLocation");
    const modalAddLocation = document.getElementById('modalAddLocation');

    if (formAddLocation && modalAddLocation) {
        const bsModal = new bootstrap.Modal(modalAddLocation);

        modalAddLocation.addEventListener('show.bs.modal', () => {
            formAddLocation.reset();
        });

        formAddLocation.addEventListener("submit", async function (event) {
            event.preventDefault();
            const submitBtn = formAddLocation.querySelector('button[type="submit"]');
            submitBtn.disabled = true;

            try {
                const formData = new FormData(this);
                const response = await fetch('../controller/addLocation.php', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    // Mostrar alerta de éxito con SweetAlert
                    Swal.fire({
                        icon: 'success',
                        title: '¡Éxito!',
                        text: data.message || 'Ubicación agregada correctamente',
                        confirmButtonColor: '#283747',
                    });

                    bsModal.hide();
                    formAddLocation.reset();
                    fetchTableLocations(); // Actualizar la tabla
                } else {
                    // Mostrar alerta de error
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.message || 'Error al agregar la ubicación',
                        confirmButtonColor: '#d33',
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de conexión',
                    text: 'Ocurrió un problema al comunicarse con el servidor',
                    confirmButtonColor: '#d33',
                });
                console.error('Error:', error);
            } finally {
                submitBtn.disabled = false;
            }
        });
    }
}