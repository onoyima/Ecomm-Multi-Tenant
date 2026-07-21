<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VendorAnalyticsController extends Controller
{
    public function dashboard(Request $req): JsonResponse
    {
        $vendor = $req->user()->vendor;
        if (!$vendor) {
            return response()->json(['success' => false, 'message' => 'No vendor profile', 'data' => null], 404);
        }
        $totalRevenue = OrderItem::where('vendor_id', $vendor->id)
            ->whereHas('order', fn($q) => $q->where('status', 'delivered'))
            ->sum(DB::raw('price * quantity'));
        $totalOrders = OrderItem::where('vendor_id', $vendor->id)->distinct('order_id')->count('order_id');
        $totalProducts = Product::where('vendor_id', $vendor->id)->count();
        $sixMonthsAgo = now()->subMonths(6);
        $monthlyData = OrderItem::where('vendor_id', $vendor->id)
            ->whereHas('order', fn($q) => $q->where('status', 'delivered'))
            ->where('created_at', '>=', $sixMonthsAgo)
            ->select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('YEAR(created_at) as year'),
                DB::raw('SUM(price * quantity) as revenue'),
                DB::raw('COUNT(DISTINCT order_id) as orders')
            )
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();
        return response()->json([
            'success' => true,
            'message' => 'Dashboard analytics',
            'data' => [
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'total_products' => $totalProducts,
                'monthly_data' => $monthlyData,
            ],
        ]);
    }

    public function topProducts(Request $req): JsonResponse
    {
        $vendor = $req->user()->vendor;
        if (!$vendor) {
            return response()->json(['success' => false, 'message' => 'No vendor profile', 'data' => null], 404);
        }
        $topProducts = OrderItem::where('vendor_id', $vendor->id)
            ->select('product_id', DB::raw('SUM(quantity) as total_sold'), DB::raw('SUM(price * quantity) as total_revenue'))
            ->groupBy('product_id')
            ->orderBy('total_sold', 'desc')
            ->limit(10)
            ->with('product')
            ->get();
        return response()->json(['success' => true, 'message' => 'Top products', 'data' => $topProducts]);
    }

    public function monthlyRevenue(Request $req): JsonResponse
    {
        $vendor = $req->user()->vendor;
        if (!$vendor) {
            return response()->json(['success' => false, 'message' => 'No vendor profile', 'data' => null], 404);
        }
        $revenue = OrderItem::where('vendor_id', $vendor->id)
            ->whereHas('order', fn($q) => $q->where('status', 'delivered'))
            ->select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('YEAR(created_at) as year'),
                DB::raw('SUM(price * quantity) as revenue')
            )
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();
        return response()->json(['success' => true, 'message' => 'Monthly revenue', 'data' => $revenue]);
    }
}
