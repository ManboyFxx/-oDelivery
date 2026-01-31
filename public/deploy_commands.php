<?php
/**
 * Hostinger Deploy Runner (Native PHP Version)
 * Access this file via browser run migrations/cache without SSH.
 */

set_time_limit(600);
ini_set('display_errors', 1);

$key = $_GET['key'] ?? '';
if ($key !== 'deploy123') {
    die("❌ Acesso negado.");
}

echo "<h1>🚀 Deploy Runner (Native + Emergency Fix)</h1>";
echo "<pre style='background:#222; color:#0f0; padding:15px; border-radius:5px;'>";

function log_msg($msg)
{
    echo "<b>> $msg</b><br>";
    flush();
}

// 1. BOOT LARAVEL
try {
    log_msg("Booting Laravel...");

    if (!file_exists(__DIR__ . '/../vendor/autoload.php')) {
        throw new Exception("Vendor folder not found! Did you push it to Git?");
    }

    require __DIR__ . '/../vendor/autoload.php';
    $app = require __DIR__ . '/../bootstrap/app.php';

    // Boot Kernel
    $kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();

    log_msg("Laravel booted successfully.");

    // Helper to run command
    function run_artisan($kernel, $cmd, $params = [])
    {
        log_msg("Running: php artisan $cmd");
        try {
            if ($cmd === 'migrate') {
                $params['--force'] = true;
            }
            $status = $kernel->call($cmd, $params);
            $output = $kernel->output();
            echo "<div style='color:#ccc; margin-left:15px; border-left:2px solid #555; padding-left:10px;'>"
                . nl2br(htmlspecialchars($output))
                . "</div>";
        } catch (Exception $e) {
            echo "<div style='color:red;'>❌ Error: " . $e->getMessage() . "</div>";
        }
    }

    // 2. MIGRATE (Standard)
    run_artisan($kernel, 'migrate');

    // 3. EMERGENCY TABLE FIX (Bypassing Migrations)
    log_msg("🚑 Checking & Fixing Critical Tables...");

    $schema = \Illuminate\Support\Facades\Schema::connection(null);
    $db = \Illuminate\Support\Facades\DB::connection(null);

    // FIX 1: whatsapp_instances
    if (!$schema->hasTable('whatsapp_instances')) {
        log_msg("Creating table: whatsapp_instances");
        $schema->create('whatsapp_instances', function ($table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->nullable()->onDelete('cascade'); // Removed constraint to avoid dependency issues for now
            $table->string('instance_name')->unique();
            $table->enum('instance_type', ['shared', 'custom'])->default('shared');
            $table->string('phone_number')->nullable();
            $table->enum('status', ['disconnected', 'connecting', 'connected'])->default('disconnected');
            $table->text('qr_code')->nullable();
            $table->timestamp('last_connected_at')->nullable();
            $table->timestamps();
            $table->index(['instance_type', 'status']);
        });
        log_msg("✅ Table whatsapp_instances created.");
    }

    // FIX 2: whatsapp_templates
    if (!$schema->hasTable('whatsapp_templates')) {
        log_msg("Creating table: whatsapp_templates");
        $schema->create('whatsapp_templates', function ($table) {
            $table->uuid('id')->primary();
            $table->string('key')->unique();
            $table->string('name');
            $table->text('message');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        log_msg("✅ Table whatsapp_templates created.");

        // Seed Templates
        $db->table('whatsapp_templates')->insertOrIgnore([
            ['id' => (string) \Illuminate\Support\Str::uuid(), 'key' => 'order_confirmed', 'name' => 'Pedido Confirmado', 'message' => 'Pedido Confirmado! {{customer_name}}', 'is_active' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => (string) \Illuminate\Support\Str::uuid(), 'key' => 'order_ready', 'name' => 'Pedido Pronto', 'message' => 'Seu pedido está pronto! {{customer_name}}', 'is_active' => 1, 'created_at' => now(), 'updated_at' => now()],
        ]);
        log_msg("✅ Seeded whatsapp_templates.");
    }

    // FIX 3: whatsapp_message_logs
    if (!$schema->hasTable('whatsapp_message_logs')) {
        log_msg("Creating table: whatsapp_message_logs");
        $schema->create('whatsapp_message_logs', function ($table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->nullable()->onDelete('cascade');
            $table->foreignUuid('order_id')->nullable()->onDelete('set null');
            $table->string('phone_number');
            $table->string('template_key');
            $table->text('message_sent');
            $table->enum('status', ['pending', 'sent', 'failed'])->default('pending');
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
        log_msg("✅ Table whatsapp_message_logs created.");
    }

    // FIX 4: Shared Instance Data
    if ($schema->hasTable('whatsapp_instances')) {
        $exists = $db->table('whatsapp_instances')->where('instance_type', 'shared')->exists();
        if (!$exists) {
            $db->table('whatsapp_instances')->insert([
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'tenant_id' => null,
                'instance_name' => 'shared_server_bot',
                'instance_type' => 'shared',
                'status' => 'disconnected',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            log_msg("✅ Created Default Shared WhatsApp Instance.");
        }
    }

    // 4. CACHE & OPTIMIZE
    run_artisan($kernel, 'optimize:clear');
    run_artisan($kernel, 'storage:link');

} catch (Throwable $e) {
    echo "<h2 style='color:red;'>FATAL ERROR</h2>";
    echo $e->getMessage() . "<br>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}

echo "</pre>";
echo "<h2>✅ Fim da execução.</h2>";
?>