<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class RefundController extends Controller {
    public function toWallet(string $orderId): JsonResponse {
        $order = Order::findOrFail($orderId);
        if ($order->payment_status !== 'paid') return response()->json(['success' => false, 'message' => 'Order not paid'], 400);
        $wallet = Wallet::firstOrCreate(['user_id' => $order->user_id], ['balance' => 0, 'currency' => 'NGN']);
        $wallet->increment('balance', $order->total);
        $order->update(['payment_status' => 'refunded']);
        Transaction::create(['wallet_id' => $wallet->id, 'type' => 'refund', 'amount' => $order->total, 'reference' => 'REF-' . strtoupper(uniqid()), 'status' => 'completed', 'description' => "Refund for order {$order->order_number}"]);
        return response()->json(['success' => true, 'message' => "Refunded {$order->total} to wallet", 'data' => ['balance' => $wallet->fresh()->balance]]);
    }
    public function toBank(string $orderId): JsonResponse {
        $order = Order::findOrFail($orderId);
        if ($order->payment_status !== 'paid') return response()->json(['success' => false, 'message' => 'Order not paid'], 400);
        $order->update(['payment_status' => 'refunded']);
        Transaction::create(['wallet_id' => null, 'type' => 'refund', 'amount' => $order->total, 'reference' => 'BNK-REF-' . strtoupper(uniqid()), 'status' => 'processing', 'description' => "Bank refund for order {$order->order_number}"]);
        return response()->json(['success' => true, 'message' => "Bank refund initiated for {$order->total}", 'data' => null]);
    }
}
