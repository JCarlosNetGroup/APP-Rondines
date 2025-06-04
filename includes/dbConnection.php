<?php

$dsn = "mysql:host=localhost;dbname=centinelapp"; // DSN (Data Source Name)
$user = "root";
$password = "";

try {
    $connection = new PDO ($dsn, $user, $password); 
    $connection -> setAttribute(PDO:: ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);   // Definicion Modo de error
}
catch(PDOException $e){
    echo"la conexion fallo: " . $e -> getMessage(); // Impresion del error en pantalla
    die();   
}

?>