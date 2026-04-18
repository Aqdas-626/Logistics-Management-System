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
        Schema::create('traccar_devices', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('traccar_device_id')->unique(); // ID from Traccar API
            $table->string('name', 160);
            $table->string('unique_id', 120)->nullable()->index(); // usually IMEI or uniqueId
            // Optional device metadata
            $table->string('model', 120)->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('category', 60)->nullable();
            $table->boolean('is_active')->default(true);
            // Sync/audit
            $table->timestamp('last_synced_at')->nullable();
            $table->json('attributes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('traccar_devices');
    }
};
