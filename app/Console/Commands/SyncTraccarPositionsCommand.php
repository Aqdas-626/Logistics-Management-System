<?php

namespace App\Console\Commands;

use App\Services\Traccar\SyncTraccarPositions;
use App\Services\Traccar\TraccarClient;
use Illuminate\Console\Command;

class SyncTraccarPositionsCommand extends Command
{
    protected $signature = 'traccar:sync-positions';

    protected $description = 'Pull latest GPS positions from Traccar and update traccar_devices (and linked vehicle GPS setups).';

    public function handle(): int
    {
        $sync = new SyncTraccarPositions(TraccarClient::fromConfig());
        $result = $sync->run();

        if ($result['skipped'] && $result['message']) {
            $this->warn($result['message']);

            return $result['ok'] ? self::SUCCESS : self::FAILURE;
        }

        if (! $result['ok']) {
            $this->error($result['message'] ?? 'Traccar sync failed.');

            return self::FAILURE;
        }

        $this->info("Traccar sync OK. Updated {$result['updated']} device position(s).");

        return self::SUCCESS;
    }
}
