<?php
/**
 * OoDelivery - Correção Permanente de Storage (v5 - Absolute Paths)
 * 
 * Este script força a criação do link simbólico usando caminhos absolutos,
 * o que é mais confiável em hospedagens como Hostinger.
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>OoDelivery - Definitive Storage Fix</h1>";

$basePath = realpath(__DIR__ . '/..');
$storagePath = $basePath . '/storage/app/public';
$publicStoragePath = __DIR__ . '/storage';

echo "Base Path: <code>$basePath</code><br>";
echo "Storage Source: <code>$storagePath</code><br>";
echo "Public Link To: <code>$publicStoragePath</code><br><br>";

// 1. Limpeza
if (file_exists($publicStoragePath)) {
    if (is_link($publicStoragePath)) {
        echo "Removendo link simbólico existente... ";
        unlink($publicStoragePath);
        echo "OK.<br>";
    } elseif (is_dir($publicStoragePath)) {
        echo "Limpando pasta real (impostora)... ";
        function rmDirRecursive($dir)
        {
            foreach (scandir($dir) as $file) {
                if ($file === '.' || $file === '..')
                    continue;
                $path = $dir . '/' . $file;
                is_dir($path) ? rmDirRecursive($path) : unlink($path);
            }
            return rmdir($dir);
        }
        if (rmDirRecursive($publicStoragePath)) {
            echo "OK.<br>";
        } else {
            echo "FALHA ao remover pasta. Tente via FTP.<br>";
        }
    }
}

// 2. Criação com absoluto
echo "Tentando criar link simbólico absoluto... ";
if (symlink($storagePath, $publicStoragePath)) {
    echo "<span style='color:green'>SUCESSO!</span><br>";
} else {
    echo "<span style='color:red'>FALHA via PHP symlink().</span><br>";

    // Tentativa via exec
    if (function_exists('shell_exec')) {
        echo "Tentando via shell_exec(ln -s)... ";
        $output = shell_exec("ln -s $storagePath $publicStoragePath 2>&1");
        if (file_exists($publicStoragePath)) {
            echo "<span style='color:green'>SUCESSO!</span><br>";
        } else {
            echo "<span style='color:red'>FALHA. Output: $output</span><br>";
        }
    }
}

// 3. Verificação final
echo "<h2>Verificação de Conteúdo</h2>";
if (file_exists($publicStoragePath . '/media')) {
    echo "<span style='color:green'>✅ Pasta 'media' encontrada através do link!</span>";
} else {
    echo "<span style='color:red'>❌ Pasta 'media' NÃO encontrada. O link pode estar quebrado.</span>";
}

echo "<br><br><a href='/'>Voltar para o site</a>";
