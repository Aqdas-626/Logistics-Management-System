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
        Schema::create('fuel_tanks', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Main Tank, Backup Tank
            $table->enum('fuel_type', ['petrol', 'diesel', 'electric', 'hybrid'])->nullable();
            $table->decimal('capacity', 12, 2)->default(0); // total capacity in liters
            $table->decimal('current_stock', 12, 2)->default(0); // current liters in stock
            $table->string('unit')->default('liter');
            $table->text('note')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fuel_tanks');
    }
};
