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
        Schema::create('job_tracking_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_booking_id')->constrained('job_bookings')->cascadeOnDelete();
            $table->foreignId('notification_type_id')->constrained('notification_types')->cascadeOnDelete();
            $table->enum('communication_type', [
                'EMAIL',
                'PHONE',
                'SMS',
                'WHATSAPP',
                'PUSH'
            ]);
            $table->string('contact_value')->nullable();
            $table->boolean('is_sent')->default(false);
            $table->boolean('enabled')->default(true);
            $table->timestamps();
            $table->unique(['job_booking_id', 'notification_type_id', 'communication_type'], 'job_notification_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_tracking_notifications');
    }
};
