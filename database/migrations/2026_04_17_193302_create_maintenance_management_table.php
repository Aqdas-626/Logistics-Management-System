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
        Schema::create('maintenance_management', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete();
            $table->foreignId('maintenance_vendor_id')->nullable()->constrained('maintenance_vendors')->nullOnDelete();
            $table->foreignId('mechanic_management_id')->nullable()->constrained('mechanic_management')->nullOnDelete();
            $table->foreignId('incident_report_id')->nullable()->constrained('incident_reports')->nullOnDelete();
            $table->foreignId('scheduler_id')->nullable()->constrained('schedulers')->nullOnDelete();
            $table->enum('status', ['planned', 'in_progress', 'completed', 'cancelled'])->default('planned');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->text('service_details')->nullable();
            $table->decimal('total_cost', 14, 2)->default(0);
            $table->string('currency', 10)->default('PKR');
            $table->string('invoice_receipt_path', 255)->nullable();
            $table->enum('priority', ['normal', 'high', 'critical'])->default('normal');
            $table->string('notification_method', 80)->nullable();
            $table->json('notify_user_ids')->nullable();
            $table->boolean('is_auto_generated')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['vehicle_id', 'status']);
            $table->index(['start_date', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_management');
    }
};
