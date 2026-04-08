<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_additional_information', function (Blueprint $table) {
            $table->dropForeign(['dg_signatory_id']);
        });

        DB::statement('ALTER TABLE job_additional_information MODIFY dg_signatory_id BIGINT UNSIGNED NULL');

        Schema::table('job_additional_information', function (Blueprint $table) {
            $table->foreign('dg_signatory_id')->references('id')->on('dg_signatories')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('job_additional_information', function (Blueprint $table) {
            $table->dropForeign(['dg_signatory_id']);
        });

        DB::statement('ALTER TABLE job_additional_information MODIFY dg_signatory_id BIGINT UNSIGNED NOT NULL');

        Schema::table('job_additional_information', function (Blueprint $table) {
            $table->foreign('dg_signatory_id')->references('id')->on('dg_signatories')->cascadeOnDelete();
        });
    }
};
