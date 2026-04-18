<?php

namespace App\Services\Traccar;

use App\Models\TraccarDevice;
use App\Models\VehicleGpsSetup;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SyncTraccarPositions
{
    public function __construct(private TraccarClient $client) {}

    /**
     * @return array{ok: bool, skipped: bool, message: ?string, updated: int}
     */
    public function run(): array
    {
        if (! config('traccar.enabled')) {
            return [
                'ok' => true,
                'skipped' => true,
                'message' => 'Traccar sync is disabled (TRACCAR_ENABLED=false).',
                'updated' => 0,
            ];
        }

        if (! $this->client->configured()) {
            return [
                'ok' => false,
                'skipped' => true,
                'message' => 'Traccar is not configured. Set TRACCAR_BASE_URL (with /api), TRACCAR_EMAIL, and TRACCAR_PASSWORD.',
                'updated' => 0,
            ];
        }

        try {
            $positions = $this->client->fetchPositions();
        } catch (\Throwable $e) {
            Log::warning('Traccar positions request failed.', [
                'exception' => $e->getMessage(),
            ]);

            return [
                'ok' => false,
                'skipped' => false,
                'message' => $e->getMessage(),
                'updated' => 0,
            ];
        }

        $updated = 0;

        DB::transaction(function () use ($positions, &$updated): void {
            foreach ($positions as $pos) {
                if (! is_array($pos)) {
                    continue;
                }

                $externalDeviceId = $pos['deviceId'] ?? null;
                if ($externalDeviceId === null) {
                    continue;
                }

                $device = TraccarDevice::query()
                    ->where('traccar_device_id', $externalDeviceId)
                    ->where('is_active', true)
                    ->first();

                if (! $device) {
                    continue;
                }

                $incomingFix = isset($pos['fixTime']) ? Carbon::parse((string) $pos['fixTime']) : null;
                if ($incomingFix && $device->last_fix_time && $incomingFix->lte($device->last_fix_time)) {
                    continue;
                }

                $lat = isset($pos['latitude']) ? (float) $pos['latitude'] : null;
                $lng = isset($pos['longitude']) ? (float) $pos['longitude'] : null;
                $valid = (bool) ($pos['valid'] ?? true);

                $device->update([
                    'last_latitude' => $lat,
                    'last_longitude' => $lng,
                    'last_fix_time' => $incomingFix,
                    'last_server_time' => isset($pos['serverTime']) ? Carbon::parse((string) $pos['serverTime']) : null,
                    'last_speed_knots' => isset($pos['speed']) ? (float) $pos['speed'] : null,
                    'last_course' => isset($pos['course']) ? (float) $pos['course'] : null,
                    'last_position_valid' => $valid,
                    'last_synced_at' => now(),
                ]);

                VehicleGpsSetup::query()
                    ->where('traccar_device_id', $device->id)
                    ->where('auto_sync', true)
                    ->update([
                        'last_synced_at' => now(),
                        'sync_message' => null,
                    ]);

                $updated++;
            }
        });

        return [
            'ok' => true,
            'skipped' => false,
            'message' => null,
            'updated' => $updated,
        ];
    }
}
