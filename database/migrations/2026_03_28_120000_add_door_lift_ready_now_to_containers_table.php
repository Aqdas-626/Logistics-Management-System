<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('containers', function (Blueprint $table) {
            $table->foreignId('door_type_id')->nullable()->after('hold_mpi')->constrained('door_types')->nullOnDelete();
            $table->foreignId('lift_type_id')->nullable()->after('door_type_id')->constrained('lift_types')->nullOnDelete();
            $table->boolean('ready_now')->default(false)->after('lift_type_id');
        });
    }

    public function down(): void
    {
        Schema::table('containers', function (Blueprint $table) {
            $table->dropConstrainedForeignId('lift_type_id');
            $table->dropConstrainedForeignId('door_type_id');
            $table->dropColumn('ready_now');
        });
    }
};
