<?php
namespace App\Services;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    protected string $secretKey;
    protected string $publicKey;
    protected string $baseUrl = 'https://api.paystack.co';

    public function __construct()
    {
        $this->secretKey = config('services.paystack.secret_key');
        $this->publicKey = config('services.paystack.public_key');
    }

    protected function client(): \Illuminate\Http\Client\PendingRequest
    {
        return Http::withToken($this->secretKey)->baseUrl($this->baseUrl);
    }

    public function initializeTransaction(string $email, int $amount, string $reference, array $metadata = []): array
    {
        $response = $this->client()->post('/transaction/initialize', [
            'email' => $email,
            'amount' => $amount * 100,
            'reference' => $reference,
            'metadata' => $metadata,
        ]);
        return $response->successful() ? $response->json() : [];
    }

    public function verifyTransaction(string $reference): array
    {
        $response = $this->client()->get("/transaction/verify/{$reference}");
        return $response->successful() ? $response->json() : [];
    }

    public function validateWebhook(\Illuminate\Http\Request $request): bool
    {
        $signature = $request->header('x-paystack-signature');
        $payload = $request->getContent();
        $expected = hash_hmac('sha512', $payload, config('services.paystack.webhook_secret'));
        return hash_equals($expected, $signature);
    }

    public function generateReference(string $prefix = 'SD'): string
    {
        return $prefix . '-' . now()->format('YmdHis') . '-' . strtoupper(substr(uniqid(), -6));
    }
}
