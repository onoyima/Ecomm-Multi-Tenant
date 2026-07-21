<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use App\Models\Payout;
use App\Models\Commission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminRevenueController extends Controller
{
    public function index(Request $req): JsonResponse
    {
        if ($req->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized', 'data' => null], 403);
        }
        $totalRevenue = OrderItem::whereHas('order', fn($q) => $q->where('status', 'delivered'))
            ->sum(DB::raw('price * quantity'));
        $totalCommission = Commission::where('status', 'paid')->sum('amount');
        $totalPayouts = Payout::where('status', 'completed')->sum('amount');
        $sixMonthsAgo = now()->subMonths(6);
        $monthlyBreakdown = OrderItem::whereHas('order', fn($q) => $q->where('status', 'delivered'))
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
            'message' => 'Revenue overview',
            'data' => [
                'total_revenue' => $totalRevenue,
                'total_commission' => $totalCommission,
                'total_payouts' => $totalPayouts,
                'net_revenue' => $totalRevenue - $totalCommission - $totalPayouts,
                'monthly_breakdown' => $monthlyBreakdown,
            ],
        ]);
    }
}
