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
        Schema::create('job_queue_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_queue_id')
                ->constrained('job_queues')
                ->cascadeOnDelete();
            // Storage path e.g. "job-queue-documents/abc.pdf"
            $table->string('file', 500); // can be image, word, pdf
            // Optional metadata
            $table->string('original_name', 255)->nullable();
            $table->string('mime_type', 120)->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->text('notes')->nullable();
            // If you track who uploaded
            $table->foreignId('uploaded_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamps();
            $table->index('job_queue_id', 'jqd_job_queue_idx');
            $table->index(['job_queue_id', 'created_at'], 'jqd_queue_created_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_queue_documents');
    }
};
