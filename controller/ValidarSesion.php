<?php
session_start();

if (!isset($_SESSION['usuario']) || $_SESSION['loggedin'] !== true) {
    header('Location: ../index.php');
    exit;
}
?>