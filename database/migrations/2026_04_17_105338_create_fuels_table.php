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
        Schema::create('fuels', function (Blueprint $table) {
            $table->id();

            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete();
            $table->foreignId('driver_id')->nullable()->constrained('drivers')->nullOnDelete();
            $table->enum('fuel_type', ['petrol', 'diesel', 'electric', 'hybrid'])->nullable();

            $table->date('fill_date');

            $table->decimal('quantity', 12, 2); // liters
            $table->decimal('odometer', 12, 2); // km or miles
            $table->decimal('amount', 12, 2)->default(0);

            $table->enum('source_type', ['tank', 'vendor']);

            $table->foreignId('fuel_tank_id')->nullable()->constrained('fuel_tanks')->nullOnDelete();
            $table->foreignId('fuel_vendor_id')->nullable()->constrained('fuel_vendors')->nullOnDelete();

            $table->string('receipt')->nullable(); // file path
            $table->text('comment')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fuels');
    }
};
