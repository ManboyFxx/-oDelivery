<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class DiagnoseHostinger extends Command
{
    protected $signature = 'diagnose:hostinger';
    protected $description = 'Diagnose common issues on Hostinger deployment';

    public function handle()
    {
        $this->info('🔍 Running Hostinger Diagnostics...\n');

        $this->checkStorageLink();
        $this->checkStorageDirectory();
        $this->checkFilePermissions();
        $this->checkEnvironmentVariables();
        $this->checkProductImageStorage();
        $this->checkSymlinkIntegrity();

        $this->info('\n✅ Diagnostics complete!');
    }

    private function checkStorageLink()
    {
        $this->info('1️⃣ Checking Storage Symlink...');

        $publicStoragePath = public_path('storage');

        if (is_link($publicStoragePath)) {
            $this->info("   ✅ Symlink exists and is valid");
            $this->info("   → Points to: " . readlink($publicStoragePath));
        } else if (is_dir($publicStoragePath)) {
            $this->error("   ❌ Directory exists but is NOT a symlink");
            $this->warn("   → Run: php artisan storage:link");
        } else {
            $this->error("   ❌ Symlink missing!");
            $this->warn("   → Run: php artisan storage:link");
        }
    }

    private function checkStorageDirectory()
    {
        $this->info('\n2️⃣ Checking Storage Directory...');

        $appPublicPath = storage_path('app/public');

        if (is_dir($appPublicPath)) {
            $this->info("   ✅ Directory exists: $appPublicPath");

            $productsDir = $appPublicPath . '/products';
            if (!is_dir($productsDir)) {
                mkdir($productsDir, 0755, true);
                $this->info("   ✅ Created products directory");
            } else {
                $this->info("   ✅ Products directory exists");
            }
        } else {
            $this->error("   ❌ Storage directory missing!");
            mkdir($appPublicPath, 0755, true);
            $this->info("   ✅ Created storage directory");
        }
    }

    private function checkFilePermissions()
    {
        $this->info('\n3️⃣ Checking File Permissions...');

        $appPublicPath = storage_path('app/public');
        $permissions = substr(sprintf('%o', fileperms($appPublicPath)), -4);

        if ($permissions === '0755') {
            $this->info("   ✅ Permissions are correct: $permissions");
        } else {
            $this->warn("   ⚠️  Current permissions: $permissions (recommended: 0755)");
            $this->info("   → Run: chmod -R 0755 " . escapeshellarg($appPublicPath));
        }

        // Check if writable
        if (is_writable($appPublicPath)) {
            $this->info("   ✅ Directory is writable");
        } else {
            $this->error("   ❌ Directory is NOT writable!");
            $this->info("   → Contact Hostinger support or check file permissions");
        }
    }

    private function checkEnvironmentVariables()
    {
        $this->info('\n4️⃣ Checking Environment Variables...');

        $diskConfig = config('filesystems.default');
        $appUrl = config('app.url');

        $this->info("   FILESYSTEM_DISK: $diskConfig");
        if ($diskConfig === 'local') {
            $this->warn("   ⚠️  Using 'local' disk - make sure storage:link is created");
        }

        $this->info("   APP_URL: $appUrl");
        if (!$appUrl || $appUrl === 'http://localhost') {
            $this->error("   ❌ APP_URL not configured properly!");
            $this->warn("   → Update .env with your Hostinger domain");
        }
    }

    private function checkProductImageStorage()
    {
        $this->info('\n5️⃣ Checking Product Image Storage...');

        try {
            $testFile = 'test-' . uniqid() . '.txt';
            $testPath = 'products/' . $testFile;

            // Try to store a test file
            Storage::disk('public')->put($testPath, 'Test file for diagnostics');

            if (Storage::disk('public')->exists($testPath)) {
                $this->info("   ✅ Can write files to public/products");

                // Clean up
                Storage::disk('public')->delete($testPath);
                $this->info("   ✅ Can delete files from public/products");
            } else {
                $this->error("   ❌ File was written but not found!");
            }
        } catch (\Exception $e) {
            $this->error("   ❌ Error testing file storage: " . $e->getMessage());
        }
    }

    private function checkSymlinkIntegrity()
    {
        $this->info('\n6️⃣ Checking Symlink Integrity...');

        $publicStoragePath = public_path('storage');
        $appPublicPath = storage_path('app/public');

        if (is_link($publicStoragePath)) {
            $target = readlink($publicStoragePath);
            $expected = realpath($appPublicPath);

            if ($target === $expected) {
                $this->info("   ✅ Symlink points to correct location");
            } else {
                $this->error("   ❌ Symlink points to wrong location!");
                $this->warn("   Expected: $expected");
                $this->warn("   Actual: $target");
                $this->info("   → Run: rm public/storage && php artisan storage:link");
            }
        }
    }
}
