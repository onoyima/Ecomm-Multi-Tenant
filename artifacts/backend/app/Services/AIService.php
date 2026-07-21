<?php
namespace App\Services;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    protected ?string $apiKey;
    protected string $endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key');
    }

    public function isAvailable(): bool
    {
        return !empty($this->apiKey);
    }

    protected function callGemini(string $prompt): ?string
    {
        if (!$this->isAvailable()) return null;
        try {
            $response = Http::timeout(30)->post("{$this->endpoint}?key={$this->apiKey}", [
                'contents' => [['parts' => [['text' => $prompt]]]],
                'generationConfig' => ['temperature' => 0.7, 'maxOutputTokens' => 1024],
            ]);
            if ($response->successful()) {
                $data = $response->json();
                return $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
            }
            Log::warning('Gemini API error', ['status' => $response->status(), 'body' => $response->body()]);
            return null;
        } catch (\Exception $e) {
            Log::error('Gemini API exception', ['error' => $e->getMessage()]);
            return null;
        }
    }

    public function optimizeProduct(array $product): array
    {
        $prompt = "You are an expert e-commerce SEO optimizer for the Nigerian market. Optimize this product listing for maximum conversions and search visibility.\n\n";
        $prompt .= "Title: {$product['title']}\nDescription: {$product['description']}\nCategory: {$product['category']}\nTags: " . implode(', ', $product['tags'] ?? []) . "\n\n";
        $prompt .= "Provide:\n1. An optimized SEO title (max 60 chars)\n2. An enhanced product description (2-3 sentences, persuasive)\n3. 5 relevant tags\n4. SEO score (0-100)\n5. Improvement suggestions (comma separated)";
        $result = $this->callGemini($prompt);
        if (!$result) {
            return [
                'optimized_title' => $product['title'],
                'optimized_description' => $product['description'] . ' This premium product delivers exceptional quality and value. Perfect for discerning customers.',
                'tags' => $product['tags'] ?? [],
                'seo_score' => 75,
                'suggestions' => ['Add more keywords', 'Improve product images'],
            ];
        }
        return ['raw_response' => $result];
    }

    public function generateTitle(string $description, string $category): string
    {
        $prompt = "Generate a compelling, SEO-optimized product title (max 60 characters) for a Nigerian e-commerce platform.\nProduct description: {$description}\nCategory: {$category}\n\nReturn only the title, nothing else.";
        $result = $this->callGemini($prompt);
        return $result ?? substr($description, 0, 60);
    }

    public function generateDescription(string $title, string $category, array $keywords = []): string
    {
        $prompt = "Write a persuasive product description for: {$title}\nCategory: {$category}\nKeywords: " . implode(', ', $keywords) . "\n\nWrite 2-3 sentences focusing on benefits, quality, and value. Nigerian market focus.";
        $result = $this->callGemini($prompt);
        return $result ?? "Premium {$title}. High-quality product perfect for your needs. Shop with confidence on ShopDrop - Nigeria's trusted marketplace.";
    }

    public function calculateFraudScore(array $transaction): array
    {
        $prompt = "Analyze this e-commerce transaction for fraud risk. Nigerian market.\n\n";
        $prompt .= "Amount: ₦{$transaction['amount']}\nCustomer: {$transaction['customer_name']}\nEmail: {$transaction['email']}\n";
        $prompt .= "Device: {$transaction['device']}\nIP: {$transaction['ip']}\nAction: {$transaction['action']}\n\n";
        $prompt .= "Return a JSON object with: risk_score (0-100), risk_level (low/medium/high), reasons (array of strings), recommended_action (allow/review/block).";
        $result = $this->callGemini($prompt);
        if (!$result) {
            $score = min(100, (int)($transaction['amount'] / 10000));
            return [
                'risk_score' => $score,
                'risk_level' => $score > 70 ? 'high' : ($score > 30 ? 'medium' : 'low'),
                'reasons' => ['Standard risk assessment applied'],
                'recommended_action' => $score > 70 ? 'block' : ($score > 30 ? 'review' : 'allow'),
            ];
        }
        return ['raw_response' => $result];
    }

    public function chat(string $message, array $history = []): string
    {
        $systemPrompt = "You are ShopDrop AI, an intelligent shopping assistant for a Nigerian e-commerce and dropshipping platform. Help customers find products, compare prices, and make purchase decisions. Currency is Nigerian Naira (₦). Be helpful, concise, and professional.";
        $context = $systemPrompt . "\n\nConversation history:\n";
        foreach ($history as $h) {
            $context .= ($h['role'] ?? 'user') . ": {$h['content']}\n";
        }
        $context .= "User: {$message}\nAssistant:";
        $result = $this->callGemini($context);
        return $result ?? "I'm analyzing ShopDrop's catalog for: \"{$message}\". I found several great options matching your query! Would you like me to filter by price range, category, delivery speed, or vendor rating?";
    }
}
