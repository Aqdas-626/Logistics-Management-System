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
        Schema::create('job_notes', function (Blueprint $table) {
            $table->id();
            $table->morphs('jobable'); // jobable_type + jobable_id
            $table->foreignId('endorsement_id')->constrained('endorsements')->cascadeOnDelete();
            $table->text('note')->nullable(); // aapke current note column ke according
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_notes');
    }
};
