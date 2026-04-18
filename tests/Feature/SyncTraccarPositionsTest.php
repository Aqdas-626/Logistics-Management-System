<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class SyncTraccarPositionsTest extends TestCase
{
    /**
     * Disabled sync must not require database access or Traccar HTTP calls.
     */
    public function test_command_exits_successfully_when_traccar_disabled(): void
    {
        Config::set('traccar.enabled', false);

        $this->artisan('traccar:sync-positions')->assertSuccessful();
    }
}
