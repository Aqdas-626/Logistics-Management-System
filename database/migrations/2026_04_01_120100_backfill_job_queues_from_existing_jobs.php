<?php

use App\Models\Cart;
use App\Models\Export;
use App\Models\Import;
use App\Models\JobQueue;
use App\Models\Swing;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $this->backfillFor(Import::class);
        $this->backfillFor(Export::class);
        $this->backfillFor(Cart::class);
        $this->backfillFor(Swing::class);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        JobQueue::query()->whereIn('jobable_type', [
            Import::class,
            Export::class,
            Cart::class,
            Swing::class,
        ])->delete();
    }

    private function backfillFor(string $className): void
    {
        $className::query()
            ->select('id')
            ->whereNull('deleted_at')
            ->chunkById(200, function ($rows) use ($className) {
                foreach ($rows as $row) {
                    JobQueue::query()->firstOrCreate([
                        'jobable_type' => $className,
                        'jobable_id' => $row->id,
                    ], [
                        'status' => 'PENDING_TBA',
                    ]);
                }
            });
    }
};
