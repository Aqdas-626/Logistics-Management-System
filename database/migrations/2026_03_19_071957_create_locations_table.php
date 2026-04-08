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
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->foreignId('country_id')->constrained()->onDelete('cascade');
            $table->foreignId('branch_id')->nullable()->constrained()->onDelete('set null');
            $table->string('name', 200);
            $table->string('location_code', 50)->nullable();
            $table->foreignId('location_type_id')->constrained()->onDelete('cascade');
            $table->foreignId('door_type_id')->constrained()->onDelete('cascade');
            $table->foreignId('lift_type_id')->constrained()->onDelete('cascade');
            $table->string('address_line_1', 255)->nullable();
            $table->string('address_line_2', 255)->nullable();
            $table->string('city', 120)->nullable();
            $table->string('state', 120)->nullable();
            $table->string('postcode', 30)->nullable();
            $table->string('contact_person', 160)->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('mobile', 50)->nullable();
            $table->string('email', 160)->nullable();
            $table->boolean('send_tracking_email')->default(false);
            $table->text('special_instruction')->nullable();
            $table->string('status', 30)->default('active');
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['company_id', 'country_id', 'branch_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
