<?php

namespace App\Services\Traccar;

use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

class TraccarClient
{
    public function __construct(
        private ?string $baseUrl = null,
        private ?string $email = null,
        private ?string $password = null,
        private ?bool $verifySsl = null,
        private ?int $timeout = null,
    ) {
        $this->baseUrl = $baseUrl ?? (string) config('traccar.base_url');
        $this->email = $email ?? (string) config('traccar.email');
        $this->password = $password ?? (string) config('traccar.password');
        $this->verifySsl = $verifySsl ?? (bool) config('traccar.verify_ssl', true);
        $this->timeout = $timeout ?? (int) config('traccar.timeout', 20);
    }

    public static function fromConfig(): self
    {
        return new self;
    }

    public function configured(): bool
    {
        $base = trim((string) $this->baseUrl);

        return $base !== ''
            && filter_var($base, FILTER_VALIDATE_URL)
            && $this->email !== null && trim((string) $this->email) !== ''
            && $this->password !== null && $this->password !== '';
    }

    /**
     * Latest positions for all devices visible to the API user (Traccar camelCase JSON).
     *
     * @return list<array<string, mixed>>
     *
     * @throws RequestException
     */
    public function fetchPositions(): array
    {
        if (! $this->configured()) {
            throw new \RuntimeException('Traccar API is not configured (TRACCAR_BASE_URL, TRACCAR_EMAIL, TRACCAR_PASSWORD).');
        }

        $url = rtrim((string) $this->baseUrl, '/').'/positions';

        $response = Http::withBasicAuth((string) $this->email, (string) $this->password)
            ->acceptJson()
            ->timeout($this->timeout)
            ->withOptions(['verify' => $this->verifySsl])
            ->get($url);

        $response->throw();

        $data = $response->json();

        return is_array($data) ? $data : [];
    }
}
