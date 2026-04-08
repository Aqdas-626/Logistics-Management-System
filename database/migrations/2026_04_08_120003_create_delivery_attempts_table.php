<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipment_id')->constrained('shipments')->cascadeOnDelete();
            $table->foreignId('job_queue_id')->nullable()->constrained('job_queues')->nullOnDelete();

            $table->unsignedInteger('attempt_no')->default(1);
            $table->enum('result', ['success', 'failed', 'rescheduled']);
            $table->string('failure_reason', 200)->nullable();
            $table->text('notes')->nullable();

            $table->foreignId('driver_id')->nullable()->constrained('drivers')->nullOnDelete();
            $table->dateTime('attempted_at');
            $table->dateTime('next_attempt_at')->nullable();

            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            $table->timestamps();

            $table->unique(['shipment_id', 'attempt_no']);
            $table->index(['driver_id', 'attempted_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_attempts');
    }
};
