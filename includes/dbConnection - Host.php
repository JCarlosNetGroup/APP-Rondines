<?php

$dsn = "mysql:host=localhost;dbname=pvxkwomy_centinelapp"; // DSN (Data Source Name)
$user = "pvxkwomy_rodinero";
$password = "rhB9526M6Q3j99W63c0N7y9Fw";

try {
    $connection = new PDO ($dsn, $user, $password); 
    $connection -> setAttribute(PDO:: ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);   // Definicion Modo de error
}
catch(PDOException $e){
    echo"la conexion fallo: " . $e -> getMessage(); // Impresion del error en pantalla
    die();   
}

?>