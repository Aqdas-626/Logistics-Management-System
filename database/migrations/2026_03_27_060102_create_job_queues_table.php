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
        Schema::create('job_queues', function (Blueprint $table) {
            $table->id();
            $table->morphs('jobable'); // jobable_type + jobable_id
            $table->enum('status', [
                'PENDING_TBA',
                'ACTIVE',
                'IN_PROCESS',
                'DISPATCH',
                'DELIVERED',
                'CANCELLED',
            ])->default('PENDING_TBA');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_queues');
    }
};
