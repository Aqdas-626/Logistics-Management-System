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
            Schema::create('vehicle_types', function (Blueprint $table) {
                $table->id();
                $table->string('name', 120)->unique();
                $table->decimal('max_weight_kg', 12, 3)->nullable();
                $table->decimal('max_volume_m3', 12, 3)->nullable();
                $table->timestamps();
            });
        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
            Schema::dropIfExists('vehicle_types');
        }
    };
