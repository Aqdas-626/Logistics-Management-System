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
        Schema::create('invoice_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoices')->cascadeOnDelete();
            // Optional source linkage
            $table->nullableMorphs('jobable'); // jobable_type + jobable_id
            $table->foreignId('revenue_id')->nullable()->constrained('revenues')->nullOnDelete();
            // Snapshot data
            $table->foreignId('charge_type_id')->nullable()->constrained('charge_types')->nullOnDelete();
            $table->string('description', 500)->nullable();
            $table->decimal('qty', 12, 3)->default(1);
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->decimal('line_discount', 15, 2)->default(0);
            $table->decimal('tax_rate', 8, 4)->default(0); // e.g. 0.1500 for 15%
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('line_total', 15, 2)->default(0);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
            $table->index(['invoice_id', 'sort_order'], 'inv_line_invoice_sort_idx');
            $table->index(['jobable_type', 'jobable_id'], 'inv_line_jobable_idx');
            $table->index('revenue_id', 'inv_line_revenue_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_lines');
    }
};
