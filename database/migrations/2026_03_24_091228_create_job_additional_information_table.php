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
        Schema::create('job_additional_information', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('job_bookings')->cascadeOnDelete();
            $table->foreignId('dg_signatory_id')->constrained('dg_signatories')->cascadeOnDelete();
            $table->enum('insurance_type', [
                'Owners Risk',
                'Carriers Risk',
                'All Risk',
                'Total Loss Only',
                'Third Party',
                'Limited Carrier Liability'
            ])->default('Owners Risk');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_additional_information');
    }
};
