<?php

namespace Tests\Unit;

use App\Services\Traccar\SyncTraccarPositions;
use App\Services\Traccar\TraccarClient;
use Illuminate\Support\Facades\Config;
use PHPUnit\Framework\MockObject\MockObject;
use Tests\TestCase;

class SyncTraccarPositionsUnitTest extends TestCase
{
    public function test_sync_skips_when_disabled_without_calling_client(): void
    {
        Config::set('traccar.enabled', false);

        /** @var TraccarClient&MockObject $client */
        $client = $this->createMock(TraccarClient::class);
        $client->expects($this->never())->method('fetchPositions');

        $result = (new SyncTraccarPositions($client))->run();

        $this->assertTrue($result['ok']);
        $this->assertTrue($result['skipped']);
        $this->assertSame(0, $result['updated']);
    }

    public function test_sync_skips_when_client_not_configured(): void
    {
        Config::set('traccar.enabled', true);

        /** @var TraccarClient&MockObject $client */
        $client = $this->createMock(TraccarClient::class);
        $client->method('configured')->willReturn(false);
        $client->expects($this->never())->method('fetchPositions');

        $result = (new SyncTraccarPositions($client))->run();

        $this->assertFalse($result['ok']);
        $this->assertTrue($result['skipped']);
    }
}
