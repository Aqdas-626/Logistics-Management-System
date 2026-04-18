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
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained('branches')->cascadeOnDelete();
            $table->foreignId('vehicle_type_id')->nullable()->constrained('vehicle_types')->nullOnDelete();
            $table->string('name', 160)->nullable();
            $table->string('image')->nullable();
            $table->string('registration_no', 60);
            $table->string('chassis_no', 60)->nullable();
            $table->string('engine_no', 60)->nullable();
            $table->string('color', 60)->nullable();
            $table->enum('fuel_type', ['petrol', 'diesel', 'electric', 'hybrid'])->nullable();
            $table->decimal('fuel_capacity', 12, 2)->nullable();
            $table->decimal('fuel_efficiency', 8, 2)->nullable()->comment('km per liter');
            $table->decimal('opening_fuel', 8, 2)->nullable()->comment('in liters');
            $table->decimal('current_fuel', 8, 2)->nullable()->comment('in liters');
            $table->string('vin', 60)->nullable();
            $table->string('status', 30)->default('active');
            $table->decimal('odometer_km', 12, 2)->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['company_id', 'registration_no']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
