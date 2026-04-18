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
        Schema::create('vehicle_gps_setups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')
                ->constrained('vehicles')
                ->cascadeOnDelete();
            // UI fields (as per screenshot)
            $table->foreignId('traccar_device_id')
                ->nullable()
                ->constrained('traccar_devices')
                ->nullOnDelete();
            $table->string('api_username', 160)->nullable()->comment('Auto-generated or synced username');
            // Practical integration fields (optional but recommended)
            $table->string('imei', 50)->nullable();
            $table->string('provider', 100)->nullable(); // e.g. Traccar
            $table->boolean('auto_sync')->default(true);
            $table->timestamp('last_synced_at')->nullable();
            $table->text('sync_message')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_gps_setups');
    }
};
