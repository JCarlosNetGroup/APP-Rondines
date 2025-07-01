<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/pages/login.css">
    <title>Centinela - Login</title>
</head>

<body>
    <div class="container-fluid vh-100 gradient-bg">
        <div class="row h-100 justify-content-center align-items-start pt-5">

            <div class="col-lg-3 col-md-6 col-sm-8 mt-5">

                <div class="text-center">
                    <img src="assets/images/_logo-inicio.png" alt="Logo Centinela" class="img-fluid logo">
                </div>

                <div class="form-container">
                    <div class="login-form p-4 px-md-5 py-md-2 m-0">

                        <h4 class="text-center mb-4">Iniciar Sesión</h4>

                        <form action="controller/loginAccess.php" method="POST">
                            <div class="mb-3">
                                <label for="username" class="form-label fw-semibold">Usuario</label>
                                <input type="text" class="form-control" id="username" name="usuario" required autocomplete="off">
                            </div>

                            <div class="mb-4 position-relative">
                                <label for="password" class="form-label fw-semibold">Contraseña</label>
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
    </div>

    <script src="assets/js/login.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>