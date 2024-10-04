<?php

require 'connection.php';

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
        $conn = getConnection();

        $dados_post = json_decode(file_get_contents("php://input"), true);

        if (!$dados_post || !isset($dados_post['conta']) || !isset($dados_post['valor']) || !isset($dados_post['parcelas']) || !isset($dados_post['diaVencimento'])) {
            http_response_code(400);
            echo json_encode(["erro" => "Dados de entrada inválidos"]);
            exit();
        }

        $id = $dados_post['id'];
        $conta = $dados_post['conta'];
        $valor = $dados_post['valor'];
        $parcelas = (int)$dados_post['parcelas'];
        $diaVencimento = $dados_post['diaVencimento'];
        $dt_pagamentoParam = NULL; // Se não houver valor, pode permanecer nulo.
        $createdAt = date('Y-m-d H:i:s');

        $sql = "INSERT INTO CONTAS (id, ds_conta, valor, parcelas, dia_vencimento, dt_pagamento, created_at) VALUES (
            $id, 
            '$conta', 
            $valor, 
            $parcelas, 
            $diaVencimento, 
            NULL, 
            '$createdAt')";

echo json_encode(["sql" => $sql]);
exit();

        $stmt = $conn->prepare("INSERT INTO CONTAS (id, ds_conta, valor, parcelas, dia_vencimento, dt_pagamento, created_at) VALUES (:id, :ds_conta, :valor, :parcelas, :dia_vencimento, :dt_pagamento, :created_at)");
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':ds_conta', $conta);
        $stmt->bindParam(':valor', $valor);
        $stmt->bindParam(':parcelas', $parcelas);
        $stmt->bindParam(':dia_vencimento', $diaVencimento);
        $stmt->bindParam(':dt_pagamento', $dt_pagamentoParam);
        $stmt->bindParam(':created_at', $createdAt);

        $stmt->execute();

        $idConta = $conn->lastInsertId();
        
        http_response_code(201);
        echo json_encode(["success" => true, "id" => $idConta]);
        
    } catch (PDOException $e) {
        http_response_code(500); // Corrigido aqui
        echo json_encode([
            "erro" => "Erro de conexão: " . $e->getMessage(),
            "codigo" => $e->getCode(),
            "arquivo" => $e->getFile(),
            "linha" => $e->getLine()
        ]);
    }
}

?>
