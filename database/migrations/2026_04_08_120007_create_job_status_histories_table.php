<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_queue_id')->constrained('job_queues')->cascadeOnDelete();

            $table->string('old_status', 50)->nullable();
            $table->string('new_status', 50);
            $table->text('remarks')->nullable();

            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('changed_at');

            $table->timestamps();

            $table->index(['job_queue_id', 'changed_at']);
            $table->index(['new_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_status_histories');
    }
};
