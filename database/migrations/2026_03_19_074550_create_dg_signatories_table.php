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
        Schema::create('dg_signatories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 200);
            $table->string('certificate_no', 80);
            $table->date('expiry_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->index('is_active');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dg_signatories');
    }
};
