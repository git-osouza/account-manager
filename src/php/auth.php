<?php

$host = "firebird02-farm10.kinghost.net:/firebird/tenhafibra.gdb";
$usuario = "tenhafibra";
$senha = "Es986532";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($metodo === 'POST') {
    try {
        $conn = new PDO("firebird:dbname=$host", $usuario, $senha);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $dados_post = json_decode(file_get_contents("php://input"), true);
        $username = $dados_post['username'];
        $senhaPost = $dados_post['senha'];

        $stmt = $conn->prepare("SELECT * FROM USUARIOS WHERE username = :username AND senha = :senha");
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':senha', $senhaPost);
        $stmt->execute();

        $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (count($resultados) > 0) {
            http_response_code(200);
            echo json_encode(["mensagem" => "Autenticado com sucesso"]);
        } else {
            http_response_code(401);
            echo json_encode(["erro" => "Usuário ou senha inválidos"]);
        }

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["erro" => "Erro ao conectar ao banco de dados: " . $e->getMessage()]);
    }
}
?>
