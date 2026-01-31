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
    // 'public', // <-- REMOVED: We will flatten this later
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
    'setup_database.php',
    'check_plans.php',
    'check_server.php',
    // 'index.php', // <-- REMOVED: We will generate a better one
    'DEPLOY_INSTRUCTIONS.txt',
    '.env.production',
    '.env.production.example',
    '.gitignore',
    'README.md',
    'DEPLOY_HOSTINGER.md'
];

filesToInclude.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            archive.directory(file, file);
        } else {
            // Special handling for renaming files in the zip
            let nameInZip = file;
            // if (file === 'htaccess_for_root.txt') nameInZip = '.htaccess';
            // if (file === '.env.production') nameInZip = '.env'; // Optional: decided not to force overwrite .env yet

            archive.file(file, { name: nameInZip });
        }
    } else {
        console.warn(`⚠️  Warning: File/Directory not found: ${file}`);
    }
});

// 4. Flatten Public Folder (Crucial for Hostinger)
console.log('📂 Flattening public directory into zip root...');
const publicDir = path.join(__dirname, 'public');

// A. Add everything from public EXCEPT index.php (we patch it)
archive.glob('**/*', {
    cwd: publicDir,
    ignore: ['index.php'], // We will add a modified version manually
    dot: true // Include .htaccess and hidden files
}, {});

// B. Add the Pre-Configured Root index.php
console.log('wrench Using dedicated public_html_index.php...');
// We read our ready-made file instead of trying to regex patch the original one
const indexContent = fs.readFileSync(path.join(__dirname, 'public_html_index.php'), 'utf8');

// Add it as 'index.php' in the zip root
archive.append(indexContent, { name: 'index.php' });


// Finalize
archive.finalize();
