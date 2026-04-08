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
        Schema::create('branch_assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();

            $table->string('asset_name');
            $table->string('asset_code')->unique();
            $table->string('category', 100)->nullable();
            $table->string('serial_no', 100)->nullable();
            $table->integer('quantity')->default(1);
            $table->string('condition')->nullable(); // new, used, damaged
            $table->date('purchase_date')->nullable();
            $table->string('status', 30)->default('active');
            $table->timestamps();
            $table->softDeletes();
            $table->index(['branch_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('branch_assets');
    }
};
