<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class ImportProductionData extends Command
{
    protected $signature = 'db:import-production {file=database/hostinger_data.sql}';
    protected $description = 'Import production MySQL data into local SQLite database';

    public function handle()
    {
        $filePath = base_path($this->argument('file'));

        if (!File::exists($filePath)) {
            $this->error("SQL file not found: {$filePath}");
            return 1;
        }

        $this->info("Importing data from: {$filePath}...");

        $sql = File::get($filePath);

        // Basic MySQL to SQLite transformations
        $this->info("Transforming SQL syntax...");

        // Remove MySQL specific settings but keep track for SQLite
        $sql = preg_replace('/SET (FOREIGN_KEY_CHECKS|SQL_MODE).*?;/i', '', $sql);

        // Skip manipulation of the migrations table to avoid breaking Laravel
        $sql = preg_replace('/DELETE FROM migrations;.*?INSERT INTO migrations.*? VALUES.*?;/is', '', $sql);

        // Remove backticks
        $sql = str_replace('`', '', $sql);

        // Split by statement (handle CRLF and different spacing)
        $statements = preg_split('/;[\r\n]+/', $sql);
        $statements = array_filter(array_map('trim', $statements));

        $this->info("Found " . count($statements) . " statements. Executing...");

        // Disable foreign keys for the entire session
        DB::statement('PRAGMA foreign_keys = OFF');

        foreach ($statements as $statement) {
            if (empty($statement) || str_starts_with($statement, '--')) {
                continue;
            }

            try {
                DB::unprepared($statement . ';');
            } catch (\Exception $e) {
                // Ignore specific common errors or log them
                if (str_contains($e->getMessage(), 'Integrity constraint violation')) {
                    $this->warn("Skipping constraint violation in: " . substr($statement, 0, 50) . "...");
                } else {
                    $this->warn("Error: " . $e->getMessage());
                }
            }
        }

        // Re-enable foreign keys
        DB::statement('PRAGMA foreign_keys = ON');

        $this->info("Import process finished!");
        return 0;
    }
}
