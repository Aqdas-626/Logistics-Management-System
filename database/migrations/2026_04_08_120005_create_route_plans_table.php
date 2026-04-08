<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('route_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained('companies')->nullOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();

            $table->string('route_code', 50)->unique();
            $table->string('route_name', 150);
            $table->date('plan_date');

            $table->foreignId('driver_vehicle_assignment_id')
                ->nullable()
                ->constrained('driver_vehicle_assignments')
                ->nullOnDelete();

            $table->enum('status', ['planned', 'started', 'completed', 'cancelled'])->default('planned');

            $table->dateTime('started_at')->nullable();
            $table->dateTime('completed_at')->nullable();

            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['plan_date', 'status']);
            $table->index(['driver_vehicle_assignment_id', 'plan_date'], 'rp_assignment_date_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('route_plans');
    }
};
