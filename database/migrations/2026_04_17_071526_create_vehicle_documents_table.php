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
        Schema::create('vehicle_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->cascadeOnDelete();

            $table->string('document_name'); // e.g. RC Book
            $table->string('file'); // file path this can be image, pdf, etc

            $table->enum('type', ['registration', 'insurance', 'other'])->default('other');

            $table->date('registration_expiry')->nullable();
            $table->date('insurance_expiry')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['vehicle_id', 'document_name', 'file']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_documents');
    }
};
