<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap" rel="stylesheet">

    <!-- CSS Pagina -->
    <link rel="stylesheet" href="assets/css/pages/login.css">

    <!-- Titulo pestaña -->
    <title>Centinela - Login</title>
</head>

<body>
    <div class="container-fluid vh-100">
        <div class="row h-100">

            <div class="col-lg-7 col-md-6 d-none d-md-block bg-image"></div>

            <div class="col-lg-5 col-md-6 col-sm-12 d-flex align-items-center form-container">

                <div class="login-form p-5 w-100">

                    <div class="text-center mb-4 d-md-none d-block">
                        <img src="assets/images/_logo-inicio.png" alt="Logo Centinela" class="img-fluid logo-mobile">
                    </div>

                    <h3 class="text-center mb-4">Iniciar Sesión</h3>

                    <form action="controller/loginAccess.php" method="POST">
                        <div class="mb-3">
                            <label for="username" class="form-label">Usuario</label>
                            <input type="text" class="form-control" id="username" name="usuario" required autocomplete="off">
                        </div>

                        <div class="mb-5 position-relative">
                            <label for="password" class="form-label">Contraseña</label>
                            <input type="password" class="form-control" id="password" name="contraseña" autocomplete="current-password" required>
                            <i id="togglePassword" class="bi bi-eye-slash-fill password-toggle-icon" onclick="togglePasswordVisibility()"></i>
                        </div>

                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-form">Ingresar</button>
                        </div>
                    </form>

                </div>

            </div>

        </div>

    </div>

    <!-- Script login -->
    <script src="assets/js/login.js"></script>

    <!-- sweetAlert2 -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    <!-- Bootstrap -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>