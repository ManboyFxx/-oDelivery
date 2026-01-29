<?php
// Script para descompactar o deploy no servidor Hostinger
// Nome do arquivo: unzip_deploy.php

$zipFile = 'deploy.zip';
$extractPath = __DIR__;

if (!file_exists($zipFile)) {
    http_response_code(404);
    die("Arquivo $zipFile não encontrado.");
}

$zip = new ZipArchive;
$res = $zip->open($zipFile);

if ($res === TRUE) {
    $zip->extractTo($extractPath);
    $zip->close();

    // Opcional: Apagar o zip depois de extrair para economizar espaço
    unlink($zipFile);

    echo "Sucesso! Arquivos extraídos em $extractPath";
} else {
    http_response_code(500);
    echo "Erro ao abrir o arquivo ZIP. Código: $res";
}
unlink(__FILE__); // Auto-destruição deste script após o uso
