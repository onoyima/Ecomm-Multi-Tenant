<?php
namespace App\Services;
use Illuminate\Support\Facades\Http;

class SupabaseService
{
    protected string $url;
    protected string $anonKey;
    protected string $serviceRoleKey;
    protected string $storageBucket;

    public function __construct()
    {
        $this->url = config('supabase.url');
        $this->anonKey = config('supabase.anon_key');
        $this->serviceRoleKey = config('supabase.service_role_key');
        $this->storageBucket = config('supabase.storage_bucket');
    }

    public function getUrl(): string { return $this->url; }
    public function getAnonKey(): string { return $this->anonKey; }
    public function getServiceRoleKey(): string { return $this->serviceRoleKey; }
    public function getStorageBucket(): string { return $this->storageBucket; }

    public function storage(): self { return $this; }

    public function upload(string $path, $file, string $bucket = null): ?string
    {
        $bucket = $bucket ?? $this->storageBucket;
        $response = Http::withToken($this->serviceRoleKey)
            ->withHeaders(['Content-Type' => 'multipart/form-data'])
            ->attach('file', $file, basename($path))
            ->post("{$this->url}/storage/v1/object/{$bucket}/{$path}");
        return $response->successful() ? "{$this->url}/storage/v1/object/public/{$bucket}/{$path}" : null;
    }

    public function delete(string $path, string $bucket = null): bool
    {
        $bucket = $bucket ?? $this->storageBucket;
        $response = Http::withToken($this->serviceRoleKey)
            ->delete("{$this->url}/storage/v1/object/{$bucket}/{$path}");
        return $response->successful();
    }

    public function getPublicUrl(string $path, string $bucket = null): string
    {
        $bucket = $bucket ?? $this->storageBucket;
        return "{$this->url}/storage/v1/object/public/{$bucket}/{$path}";
    }
}
