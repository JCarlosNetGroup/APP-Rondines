<?php
require_once "../controller/ListRoles.php";
include_once '../controller/ValidarSesion.php'
?>

<!doctype html>
<html lang="es">

<head>
    <title>Usuarios</title>

    <meta charset="utf-8" />
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no" />

    <!-- Bootstrap CSS -->
    <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN"
        crossorigin="anonymous" />

    <!-- icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">

    <!-- CSS -->
    <link rel="stylesheet" href="../assets/css/components/sidebar.css">

    <link rel="stylesheet" href="../assets/css/pages/usuarios.css">
</head>

<body>

    <div class="content-main d-flex">

        <!-- componente sidebar -->
        <?php include_once '../components/sidebar.php' ?>

        <main class="flex-grow-1">

            <header>
                <div class="info-section d-flex">
                    <i class="bi bi-people-fill"></i>
                    <h2>Usuarios</h2>
                </div>

                <div class="description-section pb-4">
                    <p>Modulo de administracion de Usuarios y Permisos</p>
                </div>
            </header>

            <!-- Boton "Nuevo Uusario y cuadro de busqueda -->

            <div class="d-flex justify-content-end align-items-center pt-1 pb-3 gap-3">
                <div class="d-flex align-items-center gap-2">
                    <label for="selectEstado" class="mb-0">Estado:</label>
                    <select id="selectEstado" class="form-select form-select-sm">
                        <option value="activo">Activo</option>
                        <option value="bloqueado">Bloqueado</option>
                        <option value="suspendido">Suspendido</option>
                    </select>

                    <label for="inputBusqueda" class="mb-0">Buscar:</label>
                    <input type="search" id="inputBusqueda" class="inputsearch">
                </div>

                <button class="btn iconModal px-1 py-0" data-bs-toggle="modal" data-bs-target="#addUser" title="Agregar Usuario Usuario">
                    <i class="bi bi-plus-square-fill"></i>
                </button>
            </div>


            <!-- //* Modal "Agregar Usuario" -->

            <div class="modal fade" id="addUser" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Agregar Usuario</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form class="formulario" id="formAddUser" method="post" enctype="multipart/form-data">
                            <div class="modal-body">

                                <div class="form-floating mb-3">
                                    <input class="form-control" type="text" id="nombre" name="nombre" autocomplete="off" placeholder="" required>
                                    <label for="nombre" class="form-label">Nombre</label>
                                </div>

                                <div class="form-floating mb-3">
                                    <input class="form-control" type="text" id="apellido" name="apellido" autocomplete="off" placeholder="" required>
                                    <label for="apellido" class="form-label">Apellido</label>
                                </div>

                                <div class="form-floating mb-3">
                                    <input class="form-control" type="text" id="puesto" name="puesto" autocomplete="off" placeholder="" required>
                                    <label for="puesto" class="form-label">Puesto</label>
                                </div>

                                <div class="form-floating mb-3">
                                    <input class="form-control" type="text" id="telefono" name="telefono" autocomplete="off" placeholder="" required>
                                    <label for="telefono" class="form-label">Telefono</label>
                                </div>


                                <div class="form-floating mb-3">
                                    <input class="form-control" type="text" id="usuario" name="usuario" autocomplete="off" placeholder="" required>
                                    <label for="usuario" class="form-label">Nombre de usuario</label>
                                </div>

                                <div class="form-floating mb-3">
                                    <input class="form-control" type="text" id="contrasena" name="contrasena" autocomplete="off" placeholder="" required>
                                    <label for="contrasena" class="form-label">Contraseña</label>
                                </div>

                                <!-- Campos existentes de rol y estado -->
                                <div class="mb-3">
                                    <label for="agregarRol" class="form-label">Rol</label>
                                    <select class="form-select" id="agregarRol" name="rol_id" required>
                                        <option value="">Selecciona su rol</option>
                                        <?php
                                        foreach ($roles as $rol) {
                                            echo '<option value="' . htmlspecialchars($rol['id_rol']) . '">'
                                                . htmlspecialchars($rol['nombre_rol']) . '</option>';
                                        }
                                        ?>
                                    </select>
                                </div>

                                <div class="mb-3">
                                    <label for="status" class="form-label">Estado</label>
                                    <select class="form-select" id="status" name="estado" required>
                                        <option value="">Selecciona el Estado</option>
                                        <option value="activo">Activo</option>
                                        <option value="bloqueado">Bloqueado</option>
                                        <option value="Inhabilitado">Inhabilitado</option>
                                    </select>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                                <button type="submit" name="enviar" class="btn btnModal">Agregar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>


            <!-- //*Declaracion de Modal Editar Registro -->

            <div class="modal fade" id="editUser" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Editar Usuario</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form class="formulario" method="post" action="" id="formEditarUsuario" enctype="multipart/form-data">
                            <div class="modal-body">

                                <div class="form-floating mb-3">
                                    <input class="form-control" type="text" id="editarNombre" name="nombre" autocomplete="off" placeholder="" required>
                                    <label for="editarNombre" class="form-label">Nombre</label>
                                </div>

                                <div class="form-floating mb-3">
                                    <input class="form-control" type="text" id="editarApellido" name="apellido" autocomplete="off" placeholder="" required>
                                    <label for="editarApellido" class="form-label">Apellido</label>
                                </div>

                                <div class="form-floating mb-3">
                                    <input class="form-control" type="text" id="editarPuesto" name="puesto" autocomplete="off" placeholder="" required>
                                    <label for="editarPuesto" class="form-label">Puesto</label>
                                </div>

                                <div class="form-floating mb-3">
                                    <input class="form-control" type="text" id="editarTelefono" name="telefono" autocomplete="off" placeholder="" required>
                                    <label for="editarTelefono" class="form-label">Telefono</label>
                                </div>

                                <div class="form-floating mb-3">
                                    <input class="form-control" type="text" id="editarUsuario" name="usuario" autocomplete="off" placeholder="" required>
                                    <label for="usuario" class="form-label">Nombre de usuario</label>
                                </div>

                                <div class="form-floating mb-3">
                                    <input class="form-control" type="text" id="editarContrasena" name="contrasena" autocomplete="off" placeholder="" required>
                                    <label for="contrasena" class="form-label">Contraseña</label>
                                </div>

                                <div class="mb-3">
                                    <label for="editarRol" class="form-label">Rol</label>
                                    <select class="form-select" id="editarRol" name="rol_id" required>
                                        <option value="">Selecciona su rol</option>
                                        <?php
                                        foreach ($roles as $rol) {

                                            echo '<option value="' . htmlspecialchars($rol['id_rol']) . '">'
                                                . htmlspecialchars($rol['nombre_rol']) . '</option>';
                                        }
                                        ?>
                                    </select>
                                </div>

                                <div class="mb-3">
                                    <label for="editarEstado" class="form-label">Estado</label>
                                    <select class="form-select" id="editarEstado" name="estado" required>
                                        <option value="">Selecciona el Estado</option>
                                        <option value="activo">Activo</option>
                                        <option value="bloqueado">Bloqueado</option>
                                        <option value="suspendido">Suspendido</option>
                                    </select>
                                </div>

                                <input type="hidden" id="editarIdEmpleado" name="id_empleado">

                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                                <button type="submit" name="enviar" class="btn btnModal">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Declaracion de la tabla de usuarios -->

            <div class="row pt-3 ">
                <div class="col">
                    <table class="table table-sm table-striped table-hover" id="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Apellido</th>
                                <!-- <th>Puesto</th> -->
                                <th>Telefono</th>
                                <th>Rol</th>
                                <!-- <th>Usuario</th>
                                <th>Contraseña</th> -->
                                <th>Estado</th>
                                <th>Editar</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>



            <!-- script-componente-sidebar -->
            <script src="../assets/js/components/sidebar.js"></script>

            <script src="../assets/js/pages/usuarios.js"></script>

            <!-- Bootstrap JavaScript Libraries -->
            <script
                src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"
                integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r"
                crossorigin="anonymous"></script>

            <script
                src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.min.js"
                integrity="sha384-BBtl+eGJRgqQAUMxJ7pMwbEyER4l1g+O15P+16Ep7Q9Q+zqX6gSbd85u4mG4QzX+"
                crossorigin="anonymous"></script>

        </main>
    </div>
</body>

</html>