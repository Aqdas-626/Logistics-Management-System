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
        Schema::create('drivers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('driver_code', 60);
            $table->string('name', 200);
            $table->string('phone', 50)->nullable();
            $table->string('email', 160)->nullable();
            $table->string('license_no', 100)->nullable();
            $table->date('license_expiry')->nullable();
            $table->string('status', 30)->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'driver_code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('drivers');
    }
};
