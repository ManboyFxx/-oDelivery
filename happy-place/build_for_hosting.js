import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const OUTPUT_FILE = path.join(__dirname, 'deploy.zip');
const BUILD_CMD = 'npm run build';

console.log('🚀 Starting Hostinger deployment build process...');

// 1. Build Frontend
console.log('📦 Building frontend assets...');
try {
    execSync(BUILD_CMD, { stdio: 'inherit' });
} catch (error) {
    console.error('❌ Build failed!');
    process.exit(1);
}

// 2. Create Zip
console.log(`\n🤐 Zipping files to ${path.basename(OUTPUT_FILE)}...`);
const output = fs.createWriteStream(OUTPUT_FILE);
const archive = archiver('zip', {
    zlib: { level: 9 } // Highest compression
});

output.on('close', function () {
    console.log(`\n✅ Success! Deployment package created.`);
    console.log(`📁 File: ${OUTPUT_FILE}`);
    console.log(`📊 Size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
    console.log(`\nNext steps:`);
    console.log(`1. Upload 'deploy.zip' to your Hostinger public_html folder.`);
    console.log(`2. Access https://your-domain.com/unzip_deploy.php`);
});

archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
        console.warn('⚠️  Warning:', err);
    } else {
        throw err;
    }
});

archive.on('error', function (err) {
    throw err;
});

archive.pipe(output);

// 3. Add Files
const filesToInclude = [
    'app',
    'bootstrap',
    'config',
    'database',
    'public',
    'resources',
    'routes',
    'storage',
    'tests',
    'vendor',
    'artisan',
    'composer.json',
    'composer.lock',
    'package.json',
    'vite.config.js',
    'unzip_deploy.php',
    'clear_cache.php',
    'check_plans.php',
    '.env.production',
    '.env.production.example',
    '.gitignore',
    'README.md'
];

filesToInclude.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            archive.directory(file, file);
        } else {
            archive.file(file, { name: file });
        }
    } else {
        console.warn(`⚠️  Warning: File/Directory not found: ${file}`);
    }
});

// Finalize
archive.finalize();
