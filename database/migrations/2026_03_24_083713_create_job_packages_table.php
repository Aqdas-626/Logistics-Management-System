<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('job_packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('job_bookings')->cascadeOnDelete();
            $table->string('package_name');
            $table->unsignedInteger('units')->default(1);
            $table->decimal('weight_kg', 12, 3)->default(0);
            $table->decimal('length_cm', 12, 2)->nullable();
            $table->decimal('width_cm', 12, 2)->nullable();
            $table->decimal('height_cm', 12, 2)->nullable();
            $table->decimal('cubic_m3', 12, 4)->nullable();
            $table->foreignId('package_type_id')->nullable()->constrained('package_types')->nullOnDelete();
            $table->foreignId('dg_type_id')->nullable()->constrained('dg_types')->nullOnDelete();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_packages');
    }
};
