<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\SeoMeta;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

class SeoController extends Controller
{
    public function sitemap(): \Illuminate\Http\Response
    {
        $products = Product::where('is_active', true)->get(['id', 'updated_at']);
        $categories = Category::where('is_active', true)->get(['id', 'updated_at']);
        $vendors = Vendor::where('status', 'approved')->get(['id', 'updated_at']);

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        $xml .= "  <url>\n    <loc>" . url('/') . "</loc>\n    <priority>1.0</priority>\n  </url>\n";

        foreach ($products as $product) {
            $xml .= "  <url>\n    <loc>" . url("/products/{$product->id}") . "</loc>\n    <lastmod>{$product->updated_at->toW3cString()}</lastmod>\n    <priority>0.8</priority>\n  </url>\n";
        }

        foreach ($categories as $category) {
            $xml .= "  <url>\n    <loc>" . url("/categories/{$category->id}") . "</loc>\n    <lastmod>{$category->updated_at->toW3cString()}</lastmod>\n    <priority>0.6</priority>\n  </url>\n";
        }

        foreach ($vendors as $vendor) {
            $xml .= "  <url>\n    <loc>" . url("/vendors/{$vendor->id}") . "</loc>\n    <lastmod>{$vendor->updated_at->toW3cString()}</lastmod>\n    <priority>0.6</priority>\n  </url>\n";
        }

        $xml .= '</urlset>';

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }

    public function robotsTxt(): \Illuminate\Http\Response
    {
        $content = "User-agent: *\nAllow: /\n\nSitemap: " . url('/api/v1/seo/sitemap.xml') . "\n";

        return response($content, 200, ['Content-Type' => 'text/plain']);
    }

    public function meta(Request $req, string $type, string $id): JsonResponse
    {
        $data = null;

        switch ($type) {
            case 'product':
                $product = Product::with('vendor')->find($id);
                if ($product) {
                    $data = [
                        'title' => $product->meta_title ?? $product->title,
                        'description' => $product->meta_description ?? str($product->description)->limit(160),
                        'image' => $product->resolvePrimaryImage(),
                        'url' => url("/products/{$product->id}"),
                        'type' => 'product',
                        'schema' => [
                            '@context' => 'https://schema.org',
                            '@type' => 'Product',
                            'name' => $product->title,
                            'description' => $product->description,
                            'image' => $product->resolvePrimaryImage(),
                            'offers' => [
                                '@type' => 'Offer',
                                'price' => $product->price,
                                'priceCurrency' => 'NGN',
                                'availability' => $product->stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                            ],
                        ],
                    ];
                }
                break;

            case 'category':
                $category = Category::find($id);
                if ($category) {
                    $data = [
                        'title' => $category->name,
                        'description' => "Browse {$category->name} products",
                        'image' => $category->image_url,
                        'url' => url("/categories/{$category->id}"),
                        'type' => 'category',
                        'schema' => [
                            '@context' => 'https://schema.org',
                            '@type' => 'CollectionPage',
                            'name' => $category->name,
                        ],
                    ];
                }
                break;

            case 'vendor':
                $vendor = Vendor::with('user')->find($id);
                if ($vendor) {
                    $data = [
                        'title' => $vendor->shop_name,
                        'description' => $vendor->shop_description,
                        'url' => url("/vendors/{$vendor->id}"),
                        'type' => 'vendor',
                        'schema' => [
                            '@context' => 'https://schema.org',
                            '@type' => 'Store',
                            'name' => $vendor->shop_name,
                            'description' => $vendor->shop_description,
                        ],
                    ];
                }
                break;
        }

        if (!$data) {
            return response()->json(['success' => false, 'message' => 'Resource not found', 'data' => null], 404);
        }

        return response()->json(['success' => true, 'message' => 'Meta data retrieved', 'data' => $data]);
    }

    public function updateMeta(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'metaable_type' => 'required|string',
            'metaable_id' => 'required|string',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'keywords' => 'nullable|string',
            'canonical_url' => 'nullable|url',
            'og_image' => 'nullable|url',
        ]);
        $meta = SeoMeta::updateOrCreate(
            ['metaable_type' => $validated['metaable_type'], 'metaable_id' => $validated['metaable_id']],
            $validated
        );
        return response()->json(['success' => true, 'data' => $meta, 'message' => 'SEO meta updated']);
    }
}
