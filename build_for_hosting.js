/**
 * Build script para deploy na Hostinger
 * Cria um zip pronto para upload em public_html
 */

import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STAGING_DIR = 'deploy_staging';
const ZIP_FILE = 'deploy.zip';

// Diretórios para excluir
const EXCLUDE_DIRS = [
    '.git',
    'node_modules',
    'tests',
    'deploy_staging',
    '.idea',
    '.vscode',
    '.qwen'
];

// Arquivos para excluir
const EXCLUDE_FILES = [
    '.gitattributes',
    'deploy.zip',
    '*.ps1',
    '*.log',
    '.env',
    '.env.example',
    '.env.backup*'
];

console.log('🚀 Iniciando build para Hostinger...\n');

// 1. Limpeza
if (fs.existsSync(STAGING_DIR)) {
    console.log('🧹 Limpando staging...');
    fs.rmSync(STAGING_DIR, { recursive: true, force: true });
}
if (fs.existsSync(ZIP_FILE)) {
    fs.unlinkSync(ZIP_FILE);
}
fs.mkdirSync(STAGING_DIR);

// 2. Copiar arquivos
console.log('📦 Copiando arquivos...');

function copyDir(src, dest, excludeDirs = [], excludeFiles = []) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        // Pular diretórios excluídos
        if (entry.isDirectory() && excludeDirs.includes(entry.name)) {
            console.log(`   ⏭️  Ignorando: ${entry.name}/`);
            continue;
        }

        // Pular arquivos excluídos
        if (entry.isFile() && excludeFiles.some(pattern => {
            if (pattern.startsWith('*')) {
                return entry.name.endsWith(pattern.slice(1));
            }
            return pattern === entry.name;
        })) {
            continue;
        }

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath, excludeDirs, excludeFiles);
        } else if (entry.isSymbolicLink()) {
            // Pular symlinks (serão recriados na Hostinger via artisan storage:link)
            console.log(`   ⏭️  Ignorando symlink: ${entry.name}`);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Copiar tudo exceto diretórios/arquivos excluídos
copyDir('.', STAGING_DIR, EXCLUDE_DIRS, EXCLUDE_FILES);

// 3. Criar estrutura de storage
console.log('📁 Criando estrutura de storage...');
const storageDirs = [
    'storage/app/public',
    'storage/framework/cache',
    'storage/framework/sessions',
    'storage/framework/views',
    'storage/logs'
];

for (const dir of storageDirs) {
    const fullPath = path.join(STAGING_DIR, dir);
    fs.mkdirSync(fullPath, { recursive: true });
}

// Criar arquivo de log vazio
fs.writeFileSync(path.join(STAGING_DIR, 'storage/logs/laravel.log'), '');

// 4. Achatar pasta public (importante para Hostinger)
console.log('📄 Achatar public folder...');
const publicSrc = path.join(STAGING_DIR, 'public');
const publicDest = STAGING_DIR;

if (fs.existsSync(publicSrc)) {
    const publicFiles = fs.readdirSync(publicSrc);
    for (const file of publicFiles) {
        const srcPath = path.join(publicSrc, file);
        const destPath = path.join(publicDest, file);
        
        try {
            if (fs.statSync(srcPath).isDirectory()) {
                if (fs.existsSync(destPath)) {
                    // Merge directories
                    copyDir(srcPath, destPath);
                } else {
                    fs.cpSync(srcPath, destPath, { recursive: true });
                }
            } else if (fs.lstatSync(srcPath).isSymbolicLink()) {
                // Pular symlinks
                console.log(`   ⏭️  Ignorando symlink: ${file}`);
            } else {
                // Overwrite files (important for index.php)
                fs.copyFileSync(srcPath, destPath);
            }
        } catch (err) {
            console.log(`   ⚠️  Ignorando: ${file} (${err.code})`);
        }
    }
    
    // Remover pasta public original após copiar (apenas conteúdo, não o diretório)
    try {
        const remainingFiles = fs.readdirSync(publicSrc);
        for (const file of remainingFiles) {
            const filePath = path.join(publicSrc, file);
            try {
                if (fs.lstatSync(filePath).isSymbolicLink()) {
                    fs.unlinkSync(filePath); // Remove symlink
                } else if (fs.statSync(filePath).isDirectory()) {
                    fs.rmSync(filePath, { recursive: true, force: true });
                } else {
                    fs.unlinkSync(filePath);
                }
            } catch (err) {
                console.log(`   ⚠️  Não foi possível remover: ${file}`);
            }
        }
        // Renomear public vazio para backup (não podemos deletar se tiver symlink)
        try {
            fs.renameSync(publicSrc, publicSrc + '_backup');
            fs.rmSync(publicSrc + '_backup', { recursive: true, force: true });
        } catch (err) {
            console.log('   ⚠️  Mantendo pasta public (symlink)');
        }
    } catch (err) {
        console.log('   ⚠️  Não foi possível limpar public completamente');
    }
}

// 5. Copiar vendor (se existir)
if (fs.existsSync('vendor')) {
    console.log('📚 Copiando vendor...');
    fs.cpSync('vendor', path.join(STAGING_DIR, 'vendor'), { recursive: true });
}

// 6. Criar .htaccess raiz se não existir
const htaccessRoot = path.join(STAGING_DIR, '.htaccess');
if (!fs.existsSync(htaccessRoot)) {
    console.log('📝 Criando .htaccess raiz...');
    const htaccessContent = `<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Handle Front Controller...
    RewriteCond %{REQUEST_URI} !^public/
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
`;
    fs.writeFileSync(htaccessRoot, htaccessContent);
}

// 7. Criar arquivo de descompactação
console.log('📝 Criando unzip_deploy.php...');
const unzipContent = `<?php
/**
 * Script para extrair o deploy.zip na Hostinger
 * Use: https://seudominio.com/unzip_deploy.php
 * DELETE ESTE ARQUIVO APÓS O DEPLOY!
 */

if (!file_exists('deploy.zip')) {
    die('❌ deploy.zip não encontrado!');
}

if (!extension_loaded('zip')) {
    die('❌ Extensão ZIP não disponível!');
}

echo "<h2>🚀 Iniciando descompactação...</h2>";
echo "<pre>";

$zip = new ZipArchive;
$res = $zip->open('deploy.zip');

if ($res === TRUE) {
    $zip->extractTo('.');
    $zip->close();
    echo "✅ Descompactação concluída com sucesso!\\n";
    echo "📁 Arquivos extraídos: " . $zip->numFiles . "\\n";
    echo "\\n⚠️  IMPORTANTE: Delete este arquivo (unzip_deploy.php) agora!\\n";
} else {
    echo "❌ Erro ao abrir deploy.zip. Código: " . $res;
}

echo "</pre>";
echo "<br><a href='/'>Ir para o site</a>";
`;
fs.writeFileSync(path.join(STAGING_DIR, 'unzip_deploy.php'), unzipContent);

// 8. Criar script de setup do banco
console.log('📝 Criando setup-production-db.php...');
const setupDbContent = `<?php
/**
 * Script para rodar migrations na Hostinger
 * Use: https://seudominio.com/setup-production-db
 * DELETE ESTE ARQUIVO APÓS O SETUP!
 */

echo "<h2>🚀 Setup do Banco de Dados</h2>";
echo "<pre>";

// Bootstrap do Laravel
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

try {
    $kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
    
    echo "📡 Rodando migrations...\\n";
    $status = $kernel->call('migrate', ['--force' => true]);
    echo file_get_contents('php://stdout');
    
    if ($status === 0) {
        echo "\\n✅ Migrations executadas com sucesso!\\n";
        echo "\\n⚠️  IMPORTANTE: Delete este arquivo (setup-production-db.php) agora!\\n";
    } else {
        echo "\\n❌ Erro ao executar migrations. Verifique as configurações do banco.\\n";
    }
} catch (Exception $e) {
    echo "\\n❌ Erro: " . $e->getMessage();
}

echo "</pre>";
echo "<br><a href='/'>Ir para o site</a>";
`;
fs.writeFileSync(path.join(STAGING_DIR, 'setup-production-db.php'), setupDbContent);

// 9. Criar ZIP
console.log('🗜️  Criando deploy.zip...');

const output = fs.createWriteStream(ZIP_FILE);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
    const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
    console.log(`✅ deploy.zip criado! (${sizeInMB} MB)`);
    
    // Limpar staging (tentativa forçada no Windows)
    console.log('🧹 Limpando staging...');
    try {
        // Tenta remover symlink primeiro
        const publicPath = path.join(STAGING_DIR, 'public');
        if (fs.existsSync(publicPath)) {
            try {
                const files = fs.readdirSync(publicPath);
                for (const file of files) {
                    const filePath = path.join(publicPath, file);
                    if (fs.lstatSync(filePath).isSymbolicLink()) {
                        fs.unlinkSync(filePath);
                    }
                }
            } catch (e) {}
        }
        fs.rmSync(STAGING_DIR, { recursive: true, force: true });
    } catch (err) {
        console.log('⚠️  Não foi possível limpar staging automaticamente.');
        console.log('   Você pode deletar a pasta deploy_staging manualmente.');
    }
    
    console.log('\n🎉 Build concluído com sucesso!');
    console.log('\n📤 PRÓXIMOS PASSOS:');
    console.log('   1. Faça upload do deploy.zip para public_html na Hostinger');
    console.log('   2. Acesse: https://oodelivery.online/unzip_deploy.php');
    console.log('   3. Acesse: https://oodelivery.online/setup-production-db');
    console.log('   4. Via SSH: php artisan storage:link');
    console.log('   5. Delete unzip_deploy.php e setup-production-db.php');
    console.log('   6. Configure o .env com os dados do banco');
});

archive.on('error', (err) => {
    console.error('❌ Erro:', err);
    throw err;
});

archive.pipe(output);
archive.directory(STAGING_DIR, false);
archive.finalize();
