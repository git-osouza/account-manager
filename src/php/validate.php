<?php
require 'auth.php';

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    $token = null;

    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $token = str_replace('Bearer ', '', $_SERVER['HTTP_AUTHORIZATION']);
    }

    if ($token && validarToken($token, 'Es986532@@')) {
        echo json_encode(["valid" => true]);
    } else {
        http_response_code(401);
        echo json_encode(["valid" => false]);
    }
}

function validarToken($token, $segredo) {
    $partes = explode('.', $token);
    if (count($partes) !== 3) {
        return false;
    }

    list($headerB64, $payloadB64, $signatureB64) = $partes;

    $header = json_decode(base64UrlDecode($headerB64), true);
    $payload = json_decode(base64UrlDecode($payloadB64), true);
    $signature = base64UrlDecode($signatureB64);

    if ($payload['exp'] < time()) {
        return false;
    }

    $signatureVerificada = hash_hmac('sha256', "$headerB64.$payloadB64", $segredo, true);
    return hash_equals($signature, $signatureVerificada);
}
?>
