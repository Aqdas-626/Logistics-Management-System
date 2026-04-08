<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_booking_customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_booking_id')->constrained('job_bookings')->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->enum('role', ['consignor', 'consignee', 'booking'])->default('booking');
            $table->timestamps();

            $table->unique(['job_booking_id', 'customer_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_booking_customers');
    }
};
