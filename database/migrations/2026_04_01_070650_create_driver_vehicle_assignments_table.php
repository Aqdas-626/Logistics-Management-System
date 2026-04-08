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
        Schema::create('driver_vehicle_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('driver_id')->constrained('drivers')->cascadeOnDelete();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete();
            $table->date('assigned_from')->nullable();
            $table->date('assigned_to')->nullable(); // null means currently assigned
            $table->string('status', 30)->default('active'); // active/inactive
            $table->timestamps();
            $table->softDeletes();
            // duplicate same active/inactive record avoid karne ke liye
            $table->unique(
                ['driver_id', 'vehicle_id', 'assigned_from'],
                'dva_driver_vehicle_from_uq'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('driver_vehicle_assignments');
    }
};
