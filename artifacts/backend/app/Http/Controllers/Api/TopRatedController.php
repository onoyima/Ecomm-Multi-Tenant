<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class TopRatedController extends Controller {
    public function index(Request $req): JsonResponse {
        $limit = (int) ($req->limit ?? 20);
        $products = Product::select('products.*', DB::raw('COALESCE(AVG(reviews.rating), 0) as avg_rating'), DB::raw('COUNT(reviews.id) as review_count'))
            ->leftJoin('reviews', 'products.id', '=', 'reviews.product_id')
            ->where('products.is_active', true)
            ->groupBy('products.id')
            ->orderByDesc('avg_rating')
            ->orderByDesc('review_count')
            ->limit($limit)
            ->with('vendor')
            ->get();
        return response()->json(['success' => true, 'message' => 'Top rated products', 'data' => $products]);
    }
}
