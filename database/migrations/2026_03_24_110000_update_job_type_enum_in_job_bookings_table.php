<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Update existing values that don't match new enum (e.g. domestic, international)
        DB::table('job_bookings')->whereNotIn('job_type', ['general', 'import', 'cart', 'export', 'swing'])->update(['job_type' => 'general']);

        DB::statement("ALTER TABLE job_bookings MODIFY job_type ENUM('general', 'import', 'cart', 'export', 'swing') NOT NULL DEFAULT 'general'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE job_bookings MODIFY job_type VARCHAR(20) NOT NULL DEFAULT 'general'");
    }
};
