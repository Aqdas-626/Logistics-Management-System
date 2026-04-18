<?php

namespace Tests\Unit;

use App\Services\Traccar\TraccarClient;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class TraccarClientUnitTest extends TestCase
{
    public function test_configured_is_false_when_base_url_missing(): void
    {
        Config::set('traccar.base_url', '');
        Config::set('traccar.email', 'admin@example.com');
        Config::set('traccar.password', 'secret');

        $this->assertFalse(TraccarClient::fromConfig()->configured());
    }

    public function test_configured_is_true_when_url_email_password_present(): void
    {
        Config::set('traccar.base_url', 'https://gps.example.com/api');
        Config::set('traccar.email', 'admin@example.com');
        Config::set('traccar.password', 'secret');

        $this->assertTrue(TraccarClient::fromConfig()->configured());
    }
}
