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
        Schema::create('fuel_tank_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fuel_tank_id')->constrained('fuel_tanks')->cascadeOnDelete();

            $table->enum('type', ['in', 'out', 'adjustment']);
            $table->decimal('quantity', 12, 2); // liters

            $table->decimal('before_stock', 12, 2)->default(0);
            $table->decimal('after_stock', 12, 2)->default(0);

            $table->date('transaction_date')->nullable();

            $table->string('reference_type')->nullable();
            // e.g. fuel_entry, manual_stock_add

            $table->unsignedBigInteger('reference_id')->nullable();
            // related record id

            $table->text('remarks')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fuel_tank_transactions');
    }
};
