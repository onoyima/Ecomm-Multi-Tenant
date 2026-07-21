<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class FrequentlyBoughtTogetherController extends Controller {
    public function get(Request $req, string $productId): JsonResponse {
        $limit = (int) ($req->limit ?? 10);
        $orderIds = DB::table('order_items')->where('product_id', $productId)->distinct()->pluck('order_id');
        $alsoBoughtIds = DB::table('order_items')
            ->whereIn('order_id', $orderIds)
            ->where('product_id', '!=', $productId)
            ->select('product_id', DB::raw('COUNT(*) as frequency'))
            ->groupBy('product_id')
            ->orderByDesc('frequency')
            ->limit($limit)
            ->pluck('product_id');
        $products = Product::whereIn('id', $alsoBoughtIds)->where('is_active', true)->with('vendor')->get()
            ->sortBy(fn($p) => array_search($p->id, $alsoBoughtIds->toArray()))->values();
        return response()->json(['success' => true, 'message' => 'Frequently bought together', 'data' => $products]);
    }
}
