<?php

namespace App\Http\Controllers\Api;

use App\Events\PaymentCompleted;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Order;
use App\Models\Wallet;
use App\Models\Transaction;
use App\Services\PaystackService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function initialize(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'amount' => 'required|numeric|min:1',
            'purpose' => 'required|string|in:order_payment,wallet_topup',
            'order_id' => 'nullable|exists:orders,id',
            'metadata' => 'nullable|array',
        ]);
        $paystack = new PaystackService();
        $metadata = array_merge($validated['metadata'] ?? [], [
            'purpose' => $validated['purpose'],
            'user_id' => $req->user()->id,
        ]);
        if ($validated['purpose'] === 'order_payment' && isset($validated['order_id'])) {
            $metadata['order_id'] = $validated['order_id'];
        }
        $response = $paystack->initialize([
            'email' => $req->user()->email,
            'amount' => $validated['amount'] * 100,
            'metadata' => $metadata,
            'callback_url' => config('app.frontend_url') . '/payment/verify',
        ]);
        return response()->json(['success' => true, 'message' => 'Payment initialized', 'data' => $response]);
    }

    public function verify(string $reference): JsonResponse
    {
        try {
            $paystack = new PaystackService();
            $response = $paystack->verify($reference);
            if ($response['status'] && $response['data']['status'] === 'success') {
                $payment = Payment::updateOrCreate(
                    ['reference' => $reference],
                    [
                        'user_id' => $response['data']['metadata']['user_id'] ?? null,
                        'amount' => $response['data']['amount'] / 100,
                        'status' => 'completed',
                        'channel' => $response['data']['channel'],
                        'paid_at' => $response['data']['paid_at'],
                    ]
                );
                $metadata = $response['data']['metadata'] ?? [];
                if (isset($metadata['purpose']) && $metadata['purpose'] === 'wallet_topup') {
                    $wallet = Wallet::where('user_id', $metadata['user_id'])->first();
                    if ($wallet) {
                        DB::transaction(function () use ($wallet, $payment) {
                            $wallet->increment('balance', $payment->amount);
                            Transaction::create([
                                'wallet_id' => $wallet->id,
                                'type' => 'topup',
                                'amount' => $payment->amount,
                                'status' => 'completed',
                                'reference' => $payment->reference,
                            ]);
                        });
                    }
                }
                if (isset($metadata['purpose']) && $metadata['purpose'] === 'order_payment' && isset($metadata['order_id'])) {
                    $order = Order::find($metadata['order_id']);
                    if ($order) {
                        $order->update(['payment_status' => 'paid', 'status' => 'processing']);
                        event(new PaymentCompleted($order, $payment));
                    }
                }
                return response()->json(['success' => true, 'message' => 'Payment verified', 'data' => $payment]);
            }
            return response()->json(['success' => false, 'message' => 'Payment verification failed', 'data' => null], 400);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage(), 'data' => null], 500);
        }
    }

    public function webhook(Request $req): JsonResponse
    {
        $paystack = new PaystackService();
        if (!$paystack->verifyWebhookSignature($req)) {
            return response()->json(['success' => false, 'message' => 'Invalid signature', 'data' => null], 400);
        }
        $event = $req->input('event');
        $data = $req->input('data');
        if ($event === 'charge.success') {
            $reference = $data['reference'];
            $metadata = $data['metadata'] ?? [];
            $payment = Payment::updateOrCreate(
                ['reference' => $reference],
                [
                    'user_id' => $metadata['user_id'] ?? null,
                    'amount' => $data['amount'] / 100,
                    'status' => 'completed',
                    'channel' => $data['channel'],
                    'paid_at' => $data['paid_at'],
                ]
            );
            if (isset($metadata['purpose']) && $metadata['purpose'] === 'wallet_topup') {
                $wallet = Wallet::where('user_id', $metadata['user_id'])->first();
                if ($wallet) {
                    DB::transaction(function () use ($wallet, $payment) {
                        $wallet->increment('balance', $payment->amount);
                        Transaction::create([
                            'wallet_id' => $wallet->id,
                            'type' => 'topup',
                            'amount' => $payment->amount,
                            'status' => 'completed',
                            'reference' => $payment->reference,
                        ]);
                    });
                }
            }
            if (isset($metadata['purpose']) && $metadata['purpose'] === 'order_payment' && isset($metadata['order_id'])) {
                $order = Order::find($metadata['order_id']);
                if ($order) {
                    $order->update(['payment_status' => 'paid', 'status' => 'processing']);
                    event(new PaymentCompleted($order, $payment));
                }
            }
        }
        Log::info('Paystack webhook processed', ['event' => $event, 'reference' => $data['reference'] ?? null]);
        return response()->json(['success' => true, 'message' => 'Webhook received']);
    }
}
