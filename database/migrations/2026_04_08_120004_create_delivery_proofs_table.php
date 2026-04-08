<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_proofs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipment_id')->constrained('shipments')->cascadeOnDelete();
            $table->foreignId('delivery_attempt_id')->nullable()->constrained('delivery_attempts')->nullOnDelete();

            $table->string('receiver_name', 120)->nullable();
            $table->string('receiver_contact', 40)->nullable();
            $table->string('signature_path')->nullable();
            $table->json('photo_paths')->nullable();
            $table->text('feedback')->nullable();

            $table->dateTime('proof_captured_at');
            $table->foreignId('captured_by')->nullable()->constrained('users')->nullOnDelete();

            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            $table->timestamps();

            $table->index(['shipment_id', 'proof_captured_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_proofs');
    }
};
