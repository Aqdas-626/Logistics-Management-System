<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_bookings', function (Blueprint $table) {
            $table->foreignId('sender_customer_id')
                ->nullable()
                ->after('customer_id')
                ->constrained('customers')
                ->nullOnDelete();

            $table->foreignId('receiver_customer_id')
                ->nullable()
                ->after('sender_customer_id')
                ->constrained('customers')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('job_bookings', function (Blueprint $table) {
            $table->dropForeign(['sender_customer_id']);
            $table->dropForeign(['receiver_customer_id']);
            $table->dropColumn(['sender_customer_id', 'receiver_customer_id']);
        });
    }
};

