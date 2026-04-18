<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Enable Traccar integration
    |--------------------------------------------------------------------------
    |
    | When false, sync commands exit without calling the remote server.
    |
    */
    'enabled' => (bool) env('TRACCAR_ENABLED', false),

    /*
    |--------------------------------------------------------------------------
    | Run scheduled position sync
    |--------------------------------------------------------------------------
    |
    | When false, the scheduler will not run traccar:sync-positions. You can
    | still run the command manually or from a system cron.
    |
    */
    'schedule_enabled' => (bool) env('TRACCAR_SCHEDULE_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | API base URL (include /api)
    |--------------------------------------------------------------------------
    |
    | Per Traccar OpenAPI, the server URL is typically:
    | https://your-host.example.com/api
    |
    | Requests are made to {base_url}/positions, {base_url}/session, etc.
    |
    */
    'base_url' => env('TRACCAR_BASE_URL'),

    'email' => env('TRACCAR_EMAIL'),

    'password' => env('TRACCAR_PASSWORD'),

    'timeout' => (int) env('TRACCAR_TIMEOUT', 20),

    /*
    |--------------------------------------------------------------------------
    | Verify TLS certificates
    |--------------------------------------------------------------------------
    |
    | Set to false only for local/dev servers with self-signed certificates.
    |
    */
    'verify_ssl' => filter_var(env('TRACCAR_VERIFY_SSL', true), FILTER_VALIDATE_BOOL),

];
