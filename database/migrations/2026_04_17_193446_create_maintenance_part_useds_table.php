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
        Schema::create('maintenance_part_useds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('maintenance_management_id')->constrained('maintenance_management')->cascadeOnDelete();
            $table->foreignId('parts_stock_id')->constrained('part_stocks')->cascadeOnDelete();
            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('unit_cost_snapshot', 12, 2)->nullable();
            $table->timestamps();
            $table->unique(['maintenance_management_id', 'parts_stock_id'], 'maint_part_unique');
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_part_useds');
    }
};
