<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('route_plan_stops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('route_plan_id')->constrained('route_plans')->cascadeOnDelete();

            $table->unsignedInteger('stop_order');
            $table->string('stop_name', 150);

            $table->foreignId('location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->foreignId('shipment_id')->nullable()->constrained('shipments')->nullOnDelete();
            $table->foreignId('job_queue_id')->nullable()->constrained('job_queues')->nullOnDelete();

            $table->dateTime('eta_at')->nullable();
            $table->dateTime('ata_at')->nullable();

            $table->enum('status', ['pending', 'arrived', 'completed', 'skipped'])->default('pending');
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->unique(['route_plan_id', 'stop_order']);
            $table->index(['shipment_id']);
            $table->index(['job_queue_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('route_plan_stops');
    }
};
