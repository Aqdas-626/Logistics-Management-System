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
        Schema::create('job_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->string('booking_id', 80);
            $table->string('job_number')->nullable();
            $table->enum('job_type', ['general', 'import', 'cart', 'export', 'swing'])->default('general');
            $table->string('customer_reference')->nullable();
            $table->string('receiver_reference')->nullable();
            $table->dateTime('freight_ready_by')->nullable();
            $table->dateTime('document_received_at')->nullable();
            $table->boolean('signature_required')->default(false);
            $table->timestamps();
            $table->unique(['company_id', 'branch_id', 'booking_id'], 'company_branch_booking_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_bookings');
    }
};
