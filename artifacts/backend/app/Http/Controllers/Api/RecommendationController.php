<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductAffinityScore;
use App\Models\UserPersonalizedScore;
use App\Models\UserProductView;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RecommendationController extends Controller
{
    public function trending(Request $req): JsonResponse
    {
        $limit = (int) ($req->limit ?? 20);

        $productIds = UserProductView::select('product_id', DB::raw('SUM(view_count) as total_views'))
            ->where('last_viewed_at', '>=', now()->subDays(7))
            ->groupBy('product_id')
            ->orderByDesc('total_views')
            ->limit($limit)
            ->pluck('product_id');

        $products = Product::whereIn('id', $productIds)
            ->where('is_active', true)
            ->with('vendor')
            ->get();

        $sorted = $productIds->crossJoin([0])->mapWithKeys(fn($id) => [$id[0] => true]);
        $products = $products->sortBy(fn($p) => array_search($p->id, $productIds->toArray()))->values();

        return response()->json(['success' => true, 'message' => 'Trending products', 'data' => $products]);
    }

    public function forUser(Request $req): JsonResponse
    {
        $limit = (int) ($req->limit ?? 20);

        $scores = UserPersonalizedScore::where('user_id', $req->user()->id)
            ->orderByDesc('score')
            ->limit($limit)
            ->pluck('product_id');

        $products = Product::whereIn('id', $scores)
            ->where('is_active', true)
            ->with('vendor')
            ->get();

        return response()->json(['success' => true, 'message' => 'Personalized recommendations', 'data' => $products]);
    }

    public function relatedProducts(Request $req, string $productId): JsonResponse
    {
        $limit = (int) ($req->limit ?? 10);

        $targetIds = ProductAffinityScore::where('source_product_id', $productId)
            ->where('type', 'related')
            ->orderByDesc('score')
            ->limit($limit)
            ->pluck('target_product_id');

        $products = Product::whereIn('id', $targetIds)
            ->where('is_active', true)
            ->with('vendor')
            ->get();

        return response()->json(['success' => true, 'message' => 'Related products', 'data' => $products]);
    }

    public function alsoBought(Request $req, string $productId): JsonResponse
    {
        $limit = (int) ($req->limit ?? 10);

        $orderIds = DB::table('order_items')
            ->where('product_id', $productId)
            ->distinct()
            ->pluck('order_id');

        $alsoBoughtIds = DB::table('order_items')
            ->whereIn('order_id', $orderIds)
            ->where('product_id', '!=', $productId)
            ->select('product_id', DB::raw('COUNT(*) as frequency'))
            ->groupBy('product_id')
            ->orderByDesc('frequency')
            ->limit($limit)
            ->pluck('product_id');

        $products = Product::whereIn('id', $alsoBoughtIds)
            ->where('is_active', true)
            ->with('vendor')
            ->get();

        return response()->json(['success' => true, 'message' => 'Frequently bought together', 'data' => $products]);
    }
}
