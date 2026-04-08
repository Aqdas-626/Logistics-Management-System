<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained('companies')->nullOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();

            $table->string('shipment_no', 80)->unique();
            $table->enum('shipment_type', ['booking', 'import', 'export', 'cart', 'swing'])->default('booking');

            $table->nullableMorphs('jobable');
            $table->foreignId('job_queue_id')->nullable()->constrained('job_queues')->nullOnDelete();

            $table->enum('status', [
                'booked',
                'pickup_scheduled',
                'picked_up',
                'at_hub',
                'in_transit',
                'out_for_delivery',
                'delivered',
                'failed',
                'cancelled',
                'returned',
            ])->default('booked');

            $table->dateTime('booked_at')->nullable();
            $table->dateTime('pickup_at')->nullable();
            $table->dateTime('eta_at')->nullable();
            $table->dateTime('delivered_at')->nullable();

            $table->string('barcode', 120)->nullable()->unique();
            $table->text('remarks')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'booked_at']);
            $table->index(['customer_id', 'status']);
            $table->index(['job_queue_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
