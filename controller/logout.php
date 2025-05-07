<?php

session_start();

// Destruir la sesión
session_destroy();

// Redireccionar a login.html
header('Location: ../index.php');

?>