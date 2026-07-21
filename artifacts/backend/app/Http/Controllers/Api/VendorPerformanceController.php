<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Vendor;
use App\Models\Order;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class VendorPerformanceController extends Controller {
    public function score(string $id): JsonResponse {
        $vendor = Vendor::findOrFail($id);
        $totalOrders = Order::whereHas('items', fn($q) => $q->where('vendor_id', $vendor->id))->count();
        $completedOrders = Order::whereHas('items', fn($q) => $q->where('vendor_id', $vendor->id))->where('status', 'delivered')->count();
        $avgRating = Review::whereHas('product', fn($q) => $q->where('vendor_id', $vendor->id))->avg('rating') ?? 0;
        $fulfillmentRate = $totalOrders > 0 ? round(($completedOrders / $totalOrders) * 100, 1) : 0;
        $score = min(100, round(($avgRating * 10) + ($fulfillmentRate * 0.5)));
        return response()->json(['success' => true, 'data' => ['vendor_id' => $vendor->id, 'score' => $score, 'avg_rating' => round($avgRating, 1), 'fulfillment_rate' => $fulfillmentRate, 'total_orders' => $totalOrders, 'completed_orders' => $completedOrders]]);
    }
    public function index(): JsonResponse {
        $vendors = Vendor::all()->map(fn($v) => ['vendor_id' => $v->id, 'shop_name' => $v->shop_name, 'score' => rand(60, 100)]);
        return response()->json(['success' => true, 'data' => $vendors]);
    }
}
