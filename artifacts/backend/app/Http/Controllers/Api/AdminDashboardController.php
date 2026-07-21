<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Vendor;
use App\Models\Order;
use App\Models\OrderItem;
use App\Http\Resources\OrderResource;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function index(Request $req): JsonResponse
    {
        if ($req->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized', 'data' => null], 403);
        }
        $totalUsers = User::count();
        $totalVendors = Vendor::count();
        $totalOrders = Order::count();
        $totalRevenue = OrderItem::whereHas('order', fn($q) => $q->where('status', 'delivered'))
            ->sum(DB::raw('price * quantity'));
        $sixMonthsAgo = now()->subMonths(6);
        $monthlyRevenue = OrderItem::whereHas('order', fn($q) => $q->where('status', 'delivered'))
            ->where('created_at', '>=', $sixMonthsAgo)
            ->select(DB::raw('MONTH(created_at) as month'), DB::raw('YEAR(created_at) as year'), DB::raw('SUM(price * quantity) as revenue'))
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();
        $topVendors = Vendor::with('user')
            ->withCount(['products', 'orderItems as total_sales' => fn($q) => $q->whereHas('order', fn($o) => $o->where('status', 'delivered'))])
            ->orderBy('total_sales', 'desc')
            ->limit(10)
            ->get();
        $recentOrders = Order::with('user', 'items.product')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
        return response()->json([
            'success' => true,
            'message' => 'Dashboard data',
            'data' => [
                'total_users' => $totalUsers,
                'total_vendors' => $totalVendors,
                'total_orders' => $totalOrders,
                'total_revenue' => $totalRevenue,
                'monthly_revenue' => $monthlyRevenue,
                'top_vendors' => $topVendors,
                'recent_orders' => OrderResource::collection($recentOrders),
            ],
        ]);
    }
}
