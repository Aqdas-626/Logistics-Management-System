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
        Schema::create('part_stocks', function (Blueprint $table) {
            $table->id();
            $table->string('sku', 80)->nullable()->index();
            $table->string('name', 200);
            $table->string('unit', 20)->default('pcs');
            $table->decimal('unit_cost', 12, 2)->nullable();
            $table->unsignedInteger('stock_qty')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('part_stocks');
    }
};
