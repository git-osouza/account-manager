<?php

function getConnection() {
    $host = "firebird02-farm10.kinghost.net:/firebird/tenhafibra.gdb";
    $usuario = "tenhafibra";
    $senha = "Es986532";
    

    try {
        $conn = new PDO("firebird:dbname=$host", $usuario, $senha);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conn;
    } catch (PDOException $e) {
        echo "Erro ao conectar ao banco de dados:: " . $e->getMessage();
        exit;
    }
}
?>
