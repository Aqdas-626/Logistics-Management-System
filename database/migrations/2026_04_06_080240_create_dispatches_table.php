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
        Schema::create('dispatches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_queue_id')->constrained('job_queues')->cascadeOnDelete();
            $table->foreignId('driver_vehicle_assignment_id')->constrained('driver_vehicle_assignments')->cascadeOnDelete();
            $table->dateTime('dispatched_at');
            $table->dateTime('completed_at')->nullable();
            $table->string('status', 30)->default('IN_PROCESS');
            $table->string('notes', 255)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dispatches');
    }
};
