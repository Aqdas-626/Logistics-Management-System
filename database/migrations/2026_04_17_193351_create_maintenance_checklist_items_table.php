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
        Schema::create('maintenance_checklist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('maintenance_management_id')->constrained('maintenance_management')->cascadeOnDelete();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->string('task_item', 255);
            $table->boolean('is_done')->default(false);
            $table->timestamps();
            $table->index(['maintenance_management_id', 'sort_order'], 'mci_maintenance_id_sort_idx');
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_checklist_items');
    }
};
