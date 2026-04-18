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
        Schema::create('vehicle_vendors', function (Blueprint $table) {
            $table->id();
            // Core vendor info
            $table->string('vendor_name', 160);
            $table->string('contact_person', 160);
            $table->string('mobile_number', 30);
            $table->date('date_of_contract');
            // Status from dropdown
            $table->enum('status', ['active', 'inactive', 'on_hold'])->default('active');
            // Uploaded contract file path (pdf/image)
            $table->string('contract_document')->nullable();
            // Address
            $table->text('address');
            // Optional multi-company safety (add if your app is tenant/company based)
            // $table->foreignId('company_id')->nullable()->constrained('companies')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_vendors');
    }
};
