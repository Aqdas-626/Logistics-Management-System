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
        Schema::table('traccar_devices', function (Blueprint $table) {
            $table->decimal('last_latitude', 10, 7)->nullable()->after('attributes');
            $table->decimal('last_longitude', 10, 7)->nullable()->after('last_latitude');
            $table->timestamp('last_fix_time')->nullable()->after('last_longitude');
            $table->timestamp('last_server_time')->nullable()->after('last_fix_time');
            $table->decimal('last_speed_knots', 10, 3)->nullable()->after('last_server_time');
            $table->decimal('last_course', 8, 2)->nullable()->after('last_speed_knots');
            $table->boolean('last_position_valid')->default(false)->after('last_course');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('traccar_devices', function (Blueprint $table) {
            $table->dropColumn([
                'last_latitude',
                'last_longitude',
                'last_fix_time',
                'last_server_time',
                'last_speed_knots',
                'last_course',
                'last_position_valid',
            ]);
        });
    }
};
