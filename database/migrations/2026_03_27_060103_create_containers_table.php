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
        Schema::create('containers', function (Blueprint $table) {
            $table->id();
            $table->string('container_number', 100)->unique();
            $table->enum('job_type', ['import', 'cart', 'swing', 'export']);
            $table->unsignedBigInteger('job_id');
            $table->date('cut_off_date')->nullable();
            $table->string('grid_position', 50)->nullable();
            $table->integer('no_of_containers')->default(1);
            $table->string('reference', 100)->nullable();
            $table->foreignId('iso_code_id')->nullable()->constrained('iso_codes')->nullOnDelete();
            $table->foreignId('dg_type_id')->nullable()->constrained('dg_types')->nullOnDelete();
            $table->foreignId('shipping_id')->nullable()->constrained('shippings')->nullOnDelete();
            $table->foreignId('vessel_id')->nullable()->constrained('vessels')->nullOnDelete();
            $table->foreignId('ship_type_id')->nullable()->constrained('ship_types')->nullOnDelete();
            $table->decimal('weight', 10, 2)->nullable();
            $table->string('from_location', 150)->nullable();
            $table->string('to_location', 150)->nullable();
            $table->string('return_to', 150)->nullable();
            $table->string('security_check', 100)->nullable();
            $table->string('random_number', 100)->nullable();
            $table->string('release_ecn_number', 100)->nullable();
            $table->string('port_pin_no', 100)->nullable();
            $table->date('available_date')->nullable();
            $table->date('vb_slot_date')->nullable();
            $table->date('demurrage_date')->nullable();
            $table->integer('detention_days')->default(0);
            $table->string('voyage', 100)->nullable();
            $table->boolean('xray')->default(false);
            $table->boolean('dgs')->default(false);
            $table->boolean('live_ul')->default(false);
            $table->boolean('hold_sh')->default(false);
            $table->boolean('hold_customs')->default(false);
            $table->boolean('hold_mpi')->default(false);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('containers');
    }
};
