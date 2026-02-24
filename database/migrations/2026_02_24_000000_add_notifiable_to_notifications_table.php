<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            if (!Schema::hasColumn('notifications', 'notifiable_type')) {
                $table->string('notifiable_type')->nullable()->after('id');
            }
            if (!Schema::hasColumn('notifications', 'notifiable_id')) {
                $table->uuid('notifiable_id')->nullable()->after('notifiable_type');
            }

            // Add index for performance as per Laravel docs
            $table->index(['notifiable_id', 'notifiable_type']);
        });

        // Data migration: mapping legacy data if needed
        // Assuming user_id maps to App\Models\User and customer_id maps to App\Models\Customer
        // For now, we'll just let new notifications use the new columns.
        // Existing ones can be migrated manually if desired, 
        // but Laravel's DatabaseChannel will search by notifiable_id/type.
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['notifiable_id', 'notifiable_type']);
            $table->dropColumn(['notifiable_id', 'notifiable_type']);
        });
    }
};
