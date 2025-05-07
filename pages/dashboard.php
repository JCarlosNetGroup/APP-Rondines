<?php
session_start();
?>

<!doctype html>
<html lang="es">

<head>
    <title>Dashboard</title>

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

    <link rel="stylesheet" href="../assets/css/pages/dashboard.css">
</head>

<body>

    <div class="content-main d-flex">

        <!-- componente sidebar -->
        <?php include_once '../components/sidebar.php' ?>

        <main class="flex-grow-1">

            <header>
                <div class="info-section d-flex">
                    <i class="bi bi-grid-1x2-fill"></i>
                    <h2>Dashboard</h2>
                </div>

                <div class="description-section py-2">
                    <p>Modulo de Comunicados</p>
                </div>
            </header>

            <!-- Boton publicar comunicado -->

            <div class="col-md-9 content-button d-flex justify-content-end pt-1 pb-4">
                <button class="btn btn btnModal" data-bs-toggle="modal" data-bs-target="#miModal">Publicar Comunicado</button>
            </div>

            <!-- Seccion Comnicado principal y lista de ruta diaria -->

            <section class="d-flex justify-content-between">

                <article class="col-md-9 comunicado">
                    <header class="pt-3">
                        <h5>Título del Comunicado</h5>
                    </header>

                    <div class="contenido-comunicado py-3">
                        <div class="row row-cols-1 row-cols-md-2">
                            <div class="col">
                                <p class="descripcion-comunicado">Breve descripción o resumen del comunicado para dar contexto.</p>
                            </div>
                            <div class="col">
                                <img src="../assets//images/descarga.jpeg" alt="Imagen relacionada con el comunicado" class="img-fluid object-fit-contain" style="max-height: 200px;">
                            </div>
                        </div>
                    </div>

                    <footer class="d-flex justify-content-between align-items-center pt-3">
                        <span class="fechaComunicado">fecha</span>
                        <button class="btn btnModal btn-sm" data-bs-toggle="modal" data-bs-target="#editarModal">Editar</button>
                    </footer>
                </article>

                <aside class="col-md-2 listaRutas">
                    <p>este es el aise</p>
                </aside>

            </section>

            <!-- Seccion histoial de comunicados -->

            <section class="py-5">

                <article class="comunicado py-2">

                    <div class="row">
                        <div class="col-12">
                            <h5>Título del Comunicado</h5>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <p class="descripcion-comunicado">Breve descripción o resumen del comunicado para dar contexto.</p>
                        </div>
                        <div class="col-md-6">
                            <img src="ruta/a/la/imagen.jpg" alt="Imagen relacionada con el comunicado" class="img-fluid">
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-12">
                            <span class="fecha-comunicado">fecha</span>
                        </div>
                    </div>

                </article>

            </section>

        </main>

    </div>

    <!-- Modal "Publicar Comnicado" -->

    <div class="modal fade" id="miModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Nuevo Comunicado</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form class="formulario" method="post" action="" enctype="multipart/form-data">
                    <div class="modal-body">

                        <div class="form-floating mb-3">
                            <input class="form-control" type="text" id="agregarTitulo" name="titulo" autocomplete="off" placeholder="" required>
                            <label for="agregarTitulo" class="form-label">Agrega un titulo</label>
                        </div>

                        <div class="mb-3">
                            <textarea class="form-control" rows="4" id="agregarDescripcion" name="descripcion" autocomplete="off" placeholder="Agrega una descripcion" required></textarea>
                        </div>

                        <div class="mb-3">
                            <input class="form-control" type="file" id="agregarImagen" name="imagen">
                        </div>

                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        <button type="submit" name="enviar" class="btn btnModal">Publicar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>


    <!-- Modal "Editar Comunicado" -->

    <div class="modal fade" id="editarModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Editar Comunicado</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form class="formulario" method="post" action="" enctype="multipart/form-data">
                    <div class="modal-body">

                        <div class="form-floating mb-3">
                            <input class="form-control" type="text" id="agregarTitulo" name="titulo" autocomplete="off" placeholder="" required>
                            <label for="agregarTitulo" class="form-label">Agrega un titulo</label>
                        </div>

                        <div class="mb-3">
                            <textarea class="form-control" rows="4" id="agregarDescripcion" name="descripcion" autocomplete="off" placeholder="Agrega una descripcion" required></textarea>
                        </div>

                        <div class="mb-3">
                            <input class="form-control" type="file" id="agregarImagen" name="imagen">
                        </div>

                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        <button type="submit" name="enviar" class="btn btnModal">Publicar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- script-componente-sidebar -->
    <script src="../assets/js/components/sidebar.js"></script>

    <script src="../assets//js/pages/dashboard.js"></script>

    <!-- Bootstrap JavaScript Libraries -->
    <script
        src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"
        integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r"
        crossorigin="anonymous"></script>

    <script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.min.js"
        integrity="sha384-BBtl+eGJRgqQAUMxJ7pMwbEyER4l1g+O15P+16Ep7Q9Q+zqX6gSbd85u4mG4QzX+"
        crossorigin="anonymous"></script>
</body>

</html>

<!-- <h1>Bienvenido, <?php echo $_SESSION['nombre'] . " " . $_SESSION['apellido']; ?></h1> -->