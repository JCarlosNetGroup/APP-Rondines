    <!-- /**
    ** MENU DE NAVEGACION SITEBAR 
    */ -->

    <div class="conteiner-fluid aside-menu px-2 pt-4" id="sidebar">
        <div class="row">
            <div class="column">
                <header>
                    <a href="index.php">
                        <img src="../assets/images/_logo-inicio.png">
                    </a>
                    <button class="btn" id="toggle-sidebar"><i class="bi bi-arrow-left-right"></i></button>
                </header>

                <hr>

                <nav>
                    <ul class="nav flex-column">

                        <li>
                            <a class="nav-link" href="../pages/dashboard.php">
                                <i class="bi bi-grid-1x2-fill px-2"></i>
                                <span class="txt-collapsed">Dashboard</span>
                            </a>
                        </li>

                        <li>
                            <a class="nav-link" href="../pages/usuarios.php">
                                <i class="bi bi-people-fill px-2"></i>
                                <span class="txt-collapsed">Gestion de Usuarios</span>
                            </a>
                        </li>

                        <li>
                            <a class="nav-link" href="../pages/ubicaciones.php">
                                <i class="bi bi-pin-map-fill px-2"></i>
                                <span class="txt-collapsed">Ubicaciones</span>
                            </a>
                        </li>

                        <li>
                            <a class="nav-link" href="../pages/rondines.php">
                                <i class="bi bi-repeat px-2"></i>
                                <span class="txt-collapsed">Rondines</span>
                            </a>
                        </li>

                        <li>
                            <a class="nav-link" href="../pages/reportes.php">
                                <i class="bi bi-journals px-2"></i>
                                <span class="txt-collapsed">Reportes</span>
                            </a>
                        </li>

                        <li class="drowup">
                            <a href="#" class="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="bi bi-gear-fill ps-2 pe-1"></i>
                                <span class="txt-collapsed">Configuración</span>
                            </a>

                            <ul class="dropdown-menu text-small shadow" data-bs-theme="dark">

                        <li class="dropdown-item">
                            <?php
                            if (isset($_SESSION['usuario'])) {
                                echo $_SESSION['nombre']." ".$_SESSION['apellido'];
                            }
                            ?>
                        </li>

                        <hr class="dropdown-divider">

                        <li><a class="dropdown-item" href="#">New project...</a></li>
                        <li><a class="dropdown-item" href="#">Settings</a></li>
                        <li><a class="dropdown-item" href="#">Profile</a></li>

                        <hr class="dropdown-divider">

                        <li><a class="dropdown-item" href="../controller/logout.php">Sign out</a></li>
                    </ul>
                        </li>

                    </ul>
                </nav>

                <!-- /**
                    ** MENU DE AJUSTES DESPLEGABLE.
                */ -->



            </div>
        </div>
    </div>