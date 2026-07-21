<?php
namespace App\Services;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DropshippingService
{
    public function importFromUrl(string $url): array
    {
        try {
            $response = Http::timeout(30)->get($url);
            if (!$response->successful()) {
                return $this->fallbackImport($url);
            }
            $html = $response->body();
            return [
                'title' => $this->extractTitle($html, $url),
                'description' => $this->extractDescription($html),
                'price' => $this->extractPrice($html),
                'images' => $this->extractImages($html),
                'category' => $this->guessCategory($html),
            ];
        } catch (\Exception $e) {
            Log::error('Dropshipping import error', ['url' => $url, 'error' => $e->getMessage()]);
            return $this->fallbackImport($url);
        }
    }

    public function calculatePrice(int $supplierPrice, int $markupPercent): array
    {
        $sellingPrice = (int) round($supplierPrice * (1 + $markupPercent / 100) / 100) * 100;
        $platformFee = (int) round($sellingPrice * 0.1);
        $profit = $sellingPrice - $supplierPrice - $platformFee;
        return [
            'supplier_price' => $supplierPrice,
            'markup_percent' => $markupPercent,
            'selling_price' => $sellingPrice,
            'platform_fee' => $platformFee,
            'profit' => $profit,
            'margin_percent' => $sellingPrice > 0 ? round(($profit / $sellingPrice) * 100, 1) : 0,
        ];
    }

    protected function extractTitle(string $html, string $url): string
    {
        preg_match('/<title[^>]*>(.*?)<\/title>/si', $html, $matches);
        return trim(strip_tags($matches[1] ?? basename($url)));
    }

    protected function extractDescription(string $html): string
    {
        preg_match('/<meta[^>]+name="description"[^>]+content="([^"]+)"/si', $html, $matches);
        return html_entity_decode($matches[1] ?? 'High quality product from supplier.');
    }

    protected function extractPrice(string $html): int
    {
        preg_match('/["\']?price["\']?\s*[:=]\s*["\']?(\d+(?:\.\d+)?)["\']?/si', $html, $matches);
        return isset($matches[1]) ? (int) round((float)$matches[1]) : 0;
    }

    protected function extractImages(string $html): array
    {
        preg_match_all('/<img[^>]+src=["\']([^"\']+)["\']/si', $html, $matches);
        return array_slice(array_unique($matches[1] ?? []), 0, 5);
    }

    protected function guessCategory(string $html): string
    {
        $categories = ['Fashion', 'Electronics', 'Shoes', 'Home', 'Beauty', 'Sports', 'Books', 'Food'];
        foreach ($categories as $cat) {
            if (stripos($html, $cat) !== false) return $cat;
        }
        return 'General';
    }

    protected function fallbackImport(string $url): array
    {
        $name = basename(parse_url($url, PHP_URL_PATH) ?? 'product');
        $name = str_replace(['-', '_'], ' ', $name);
        return [
            'title' => ucwords(trim($name)),
            'description' => 'Premium quality product sourced from verified supplier. Fast shipping to Nigeria.',
            'price' => 0,
            'images' => [],
            'category' => 'General',
            'supplier' => parse_url($url, PHP_URL_HOST) ?? 'Unknown',
        ];
    }
}
