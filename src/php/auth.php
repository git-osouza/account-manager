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
    $segredo = 'Es986532@@';

    try {
        $conn = new PDO("firebird:dbname=$host", $usuario, $senha);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $dados_post = json_decode(file_get_contents("php://input"), true);

        if (!$dados_post || !isset($dados_post['username']) || !isset($dados_post['senha'])) {
            http_response_code(400);
            echo json_encode(["erro" => "Dados de entrada inválidos"]);
            exit();
        }

        $username = $dados_post['username'];
        $senhaPost = $dados_post['senha'];

        $stmt = $conn->prepare("SELECT * FROM USUARIOS WHERE username = :username AND senha = :senha");
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':senha', $senhaPost); 
        $stmt->execute();

        $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (count($resultados) > 0) {
            $usuario = $resultados[0];
            $token = gerarToken($usuario, $segredo);

            http_response_code(200);
            echo json_encode([
                "authenticate" => true,
                "token" => $token
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["authenticate" => false, "erro" => "Credenciais inválidas"]);
        } 

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["erro" => "Erro ao conectar ao banco de dados: " . $e->getMessage()]);
    }
}

function gerarToken($usuario, $segredo, $expiraEm = 3600) {
    $header = json_encode(['alg' => 'HS256', 'typ' => 'JWT']);
    $header = base64UrlEncode($header);

    $payload = json_encode([
        'iss' => 'https://account-mobile.tenhafibra.com.br',
        'iat' => time(),
        'exp' => time() + $expiraEm,
        'username' => $usuario['username'],
        'id' => $usuario['id']
    ]);
    $payload = base64UrlEncode($payload);

    $signature = hash_hmac('sha256', "$header.$payload", $segredo, true);
    $signature = base64UrlEncode($signature);

    return "$header.$payload.$signature";
}

function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
}

?>
