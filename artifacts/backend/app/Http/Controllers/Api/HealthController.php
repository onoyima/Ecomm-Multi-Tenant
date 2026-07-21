<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use App\Models\Dispute;
use Illuminate\Http\JsonResponse;
class HealthController extends Controller {
    public function index(): JsonResponse {
        $totalUsers = User::count();
        $totalOrders = Order::count();
        $totalProducts = Product::count();
        $pendingDisputes = Dispute::where('status', 'open')->count();
        $ordersToday = Order::whereDate('created_at', today())->count();
        $revenueToday = Order::whereDate('created_at', today())->where('payment_status', 'paid')->sum('total');
        return response()->json(['success' => true, 'data' => ['total_users' => $totalUsers, 'total_orders' => $totalOrders, 'total_products' => $totalProducts, 'pending_disputes' => $pendingDisputes, 'orders_today' => $ordersToday, 'revenue_today' => $revenueToday, 'server_time' => now()->toIso8601String(), 'php_version' => PHP_VERSION]]);
    }
}
