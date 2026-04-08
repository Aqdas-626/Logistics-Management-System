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
        Schema::create('vessels', function (Blueprint $table) {
            $table->id();
            $table->string('name', 200);
            $table->foreignId('country_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('ship_type_id')->nullable()->constrained()->onDelete('set null');
            $table->string('imo_number', 20)->unique();
            $table->string('mmsi', 20)->nullable();
            $table->string('call_sign', 20)->nullable();
            $table->year('built_year')->nullable();
            $table->string('status', 30)->default('active');
            $table->softDeletes();
            $table->timestamps();
            $table->unique(['country_id', 'ship_type_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vessels');
    }
};
