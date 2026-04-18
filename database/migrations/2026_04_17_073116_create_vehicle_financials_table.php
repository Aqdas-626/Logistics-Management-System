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
        Schema::create('vehicle_financials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')
                ->constrained('vehicles')
                ->cascadeOnDelete();
            // Financial tab fields
            $table->enum('billing_method', ['per_km', 'per_trip', 'monthly', 'hourly'])->default('per_km');
            $table->decimal('default_cost', 12, 2)->default(0);
            $table->enum('ownership_type', ['company_owned', 'leased', 'rented', 'vendor_owned'])->default('company_owned');
            // Optional but useful
            $table->string('currency', 10)->default('PKR');
            $table->date('effective_from')->nullable();
            $table->date('effective_to')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_financials');
    }
};
