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
        Schema::create('job_queue_hubs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_queue_id')
                ->constrained('job_queues')
                ->cascadeOnDelete();
            $table->foreignId('location_id')
                ->constrained('locations')
                ->cascadeOnDelete();
            $table->boolean('is_charge_customer')->default(false);
            // If you support multiple hubs per job, keep ordering.
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
            $table->index(['job_queue_id', 'sort_order'], 'jqh_queue_sort_idx');
            $table->unique(['job_queue_id', 'location_id'], 'jqh_queue_location_uq');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_queue_hubs');
    }
};
