<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class PartialRefundController extends Controller {
    public function store(Request $req): JsonResponse {
        $validated = $req->validate([
            'order_id' => 'required|exists:orders,id',
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'required|string|max:1000',
        ]);
        $order = Order::findOrFail($validated['order_id']);
        if ($order->payment_status !== 'paid') return response()->json(['success' => false, 'message' => 'Order not paid'], 400);
        $refunded = (float) Transaction::where('order_id', $order->id)->where('type', 'partial_refund')->where('status', 'completed')->sum('amount');
        $remaining = (float) $order->total - $refunded;
        if ((float) $validated['amount'] > $remaining) return response()->json(['success' => false, 'message' => "Amount exceeds remaining refundable balance of {$remaining}"], 400);
        $wallet = Wallet::firstOrCreate(['user_id' => $order->customer_id], ['balance' => 0, 'currency' => 'NGN']);
        $wallet->increment('balance', $validated['amount']);
        Transaction::create([
            'wallet_id' => $wallet->id,
            'order_id' => $order->id,
            'type' => 'partial_refund',
            'amount' => $validated['amount'],
            'reference' => 'PREF-' . strtoupper(uniqid()),
            'status' => 'completed',
            'description' => "Partial refund for order {$order->order_number}: {$validated['reason']}",
        ]);
        $paymentStatus = ($remaining - (float) $validated['amount']) <= 0 ? 'refunded' : 'partially_refunded';
        $order->update(['payment_status' => $paymentStatus]);
        return response()->json(['success' => true, 'message' => "Partial refund of {$validated['amount']} processed", 'data' => ['balance' => $wallet->fresh()->balance]]);
    }
}
