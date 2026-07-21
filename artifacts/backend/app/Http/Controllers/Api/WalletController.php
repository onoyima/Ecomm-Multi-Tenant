<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use App\Models\Wallet;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WalletController extends Controller
{
    use FlattensPagination;

    public function balance(Request $req): JsonResponse
    {
        $wallet = Wallet::where('user_id', $req->user()->id)->first();
        if (!$wallet) {
            $wallet = Wallet::create(['user_id' => $req->user()->id, 'balance' => 0]);
        }
        return response()->json([
            'success' => true,
            'message' => 'Balance retrieved',
            'data' => ['balance' => $wallet->balance, 'formatted' => number_format($wallet->balance, 2)],
        ]);
    }

    public function transactions(Request $req): JsonResponse
    {
        $wallet = Wallet::where('user_id', $req->user()->id)->first();
        if (!$wallet) {
            return response()->json(['success' => true, 'message' => 'No transactions', 'data' => []]);
        }
        $transactions = Transaction::where('wallet_id', $wallet->id)
            ->orderBy('created_at', 'desc')
            ->paginate($req->per_page ?? 15);
        return $this->paginatedResponse($transactions, 'Transactions retrieved', TransactionResource::class);
    }

    public function topup(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'amount' => 'required|numeric|min:100',
        ]);
        $wallet = Wallet::firstOrCreate(['user_id' => $req->user()->id], ['balance' => 0]);
        // Initialize Paystack payment
        $paystack = new \App\Services\PaystackService();
        $payment = $paystack->initialize([
            'email' => $req->user()->email,
            'amount' => $validated['amount'] * 100,
            'metadata' => ['wallet_id' => $wallet->id, 'purpose' => 'wallet_topup'],
        ]);
        return response()->json(['success' => true, 'message' => 'Payment initialized', 'data' => $payment]);
    }

    public function withdraw(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'amount' => 'required|numeric|min:100',
            'bank_name' => 'required|string|max:255',
            'bank_account_name' => 'required|string|max:255',
            'bank_account_number' => 'required|string|max:50',
        ]);
        try {
            DB::beginTransaction();
            $wallet = Wallet::where('user_id', $req->user()->id)->firstOrFail();
            if ($wallet->balance < $validated['amount']) {
                return response()->json(['success' => false, 'message' => 'Insufficient balance', 'data' => null], 422);
            }
            $wallet->decrement('balance', $validated['amount']);
            Transaction::create([
                'wallet_id' => $wallet->id,
                'type' => 'withdrawal',
                'amount' => $validated['amount'],
                'status' => 'pending',
                'reference' => 'WTH-' . strtoupper(\Illuminate\Support\Str::random(12)),
                'metadata' => json_encode([
                    'bank_name' => $validated['bank_name'],
                    'bank_account_name' => $validated['bank_account_name'],
                    'bank_account_number' => $validated['bank_account_number'],
                ]),
            ]);
            DB::commit();
            return response()->json(['success' => true, 'message' => 'Withdrawal initiated', 'data' => null]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage(), 'data' => null], 500);
        }
    }

    public function transfer(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'amount' => 'required|numeric|min:1',
            'email' => 'required|email|exists:users,email',
        ]);
        try {
            DB::beginTransaction();
            if ($req->user()->email === $validated['email']) {
                return response()->json(['success' => false, 'message' => 'Cannot transfer to self', 'data' => null], 422);
            }
            $senderWallet = Wallet::where('user_id', $req->user()->id)->firstOrFail();
            if ($senderWallet->balance < $validated['amount']) {
                return response()->json(['success' => false, 'message' => 'Insufficient balance', 'data' => null], 422);
            }
            $recipient = User::where('email', $validated['email'])->firstOrFail();
            $recipientWallet = Wallet::firstOrCreate(['user_id' => $recipient->id], ['balance' => 0]);
            $senderWallet->decrement('balance', $validated['amount']);
            $recipientWallet->increment('balance', $validated['amount']);
            $reference = 'TRF-' . strtoupper(\Illuminate\Support\Str::random(12));
            Transaction::create(['wallet_id' => $senderWallet->id, 'type' => 'transfer_out', 'amount' => $validated['amount'], 'status' => 'completed', 'reference' => $reference, 'metadata' => json_encode(['recipient_email' => $validated['email'], 'recipient_id' => $recipient->id])]);
            Transaction::create(['wallet_id' => $recipientWallet->id, 'type' => 'transfer_in', 'amount' => $validated['amount'], 'status' => 'completed', 'reference' => $reference, 'metadata' => json_encode(['sender_email' => $req->user()->email, 'sender_id' => $req->user()->id])]);
            DB::commit();
            return response()->json(['success' => true, 'message' => 'Transfer successful', 'data' => null]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage(), 'data' => null], 500);
        }
    }
}
