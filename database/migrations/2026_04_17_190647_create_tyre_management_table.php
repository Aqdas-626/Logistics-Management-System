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
        Schema::create('tyre_management', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete();
            $table->string('position', 80); // e.g. Front-Left, Rear-Left-Outer
            $table->string('serial_number', 120)->nullable()->unique();
            $table->string('brand_model', 160)->nullable();
            $table->date('install_date')->nullable();
            $table->unsignedBigInteger('install_odometer_km')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['vehicle_id', 'position']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tyre_management');
    }
};
