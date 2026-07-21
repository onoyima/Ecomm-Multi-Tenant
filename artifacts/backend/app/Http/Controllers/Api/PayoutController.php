<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PayoutResource;
use App\Models\Payout;
use App\Models\Wallet;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PayoutController extends Controller
{
    use FlattensPagination;

    public function index(Request $req): JsonResponse
    {
        $user = $req->user();
        $query = Payout::with('vendor.user');
        if ($user->role === 'vendor') {
            $query->where('vendor_id', $user->vendor?->id);
        }
        $payouts = $query->orderBy('created_at', 'desc')->paginate($req->per_page ?? 15);
        return $this->paginatedResponse($payouts, 'Payouts retrieved', PayoutResource::class);
    }

    public function store(Request $req): JsonResponse
    {
        $vendor = $req->user()->vendor;
        if (!$vendor) {
            return response()->json(['success' => false, 'message' => 'No vendor profile', 'data' => null], 404);
        }
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
            $payout = Payout::create([
                'vendor_id' => $vendor->id,
                'amount' => $validated['amount'],
                'status' => 'pending',
                'bank_name' => $validated['bank_name'],
                'bank_account_name' => $validated['bank_account_name'],
                'bank_account_number' => $validated['bank_account_number'],
            ]);
            Transaction::create([
                'wallet_id' => $wallet->id,
                'type' => 'payout',
                'amount' => $validated['amount'],
                'status' => 'pending',
                'reference' => 'PAY-' . strtoupper(\Illuminate\Support\Str::random(12)),
            ]);
            DB::commit();
            return response()->json(['success' => true, 'message' => 'Payout requested', 'data' => new PayoutResource($payout)], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage(), 'data' => null], 500);
        }
    }

    public function process(string $id, Request $req): JsonResponse
    {
        if ($req->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized', 'data' => null], 403);
        }
        $payout = Payout::find($id);
        if (!$payout) {
            return response()->json(['success' => false, 'message' => 'Payout not found', 'data' => null], 404);
        }
        $validated = $req->validate([
            'status' => 'required|string|in:processing,completed,failed',
            'transaction_reference' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);
        $payout->update($validated);
        if ($validated['status'] === 'completed') {
            $wallet = Wallet::where('user_id', $payout->vendor->user_id)->first();
            if ($wallet) {
                Transaction::where('wallet_id', $wallet->id)
                    ->where('type', 'payout')
                    ->where('status', 'pending')
                    ->latest()
                    ->first()
                    ?->update(['status' => 'completed']);
            }
        }
        return response()->json(['success' => true, 'message' => 'Payout processed', 'data' => new PayoutResource($payout->fresh()->load('vendor.user'))]);
    }

    public function cancel(string $id): JsonResponse
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized', 'data' => null], 403);
        }
        $payout = Payout::where('id', $id)->where('status', 'pending')->first();
        if (!$payout) {
            return response()->json(['success' => false, 'message' => 'Payout not found or already processed', 'data' => null], 404);
        }
        $payout->update(['status' => 'cancelled']);
        $wallet = Wallet::where('user_id', $payout->vendor->user_id)->first();
        if ($wallet) {
            $wallet->increment('balance', $payout->amount);
            Transaction::create([
                'wallet_id' => $wallet->id,
                'type' => 'payout_reversal',
                'amount' => $payout->amount,
                'status' => 'completed',
                'reference' => 'REV-' . strtoupper(\Illuminate\Support\Str::random(12)),
            ]);
        }
        return response()->json(['success' => true, 'message' => 'Payout cancelled', 'data' => new PayoutResource($payout->fresh())]);
    }

    public function show(string $id): JsonResponse
    {
        $payout = Payout::with('vendor.user')->find($id);
        if (!$payout) {
            return response()->json(['success' => false, 'message' => 'Payout not found', 'data' => null], 404);
        }
        return response()->json(['success' => true, 'message' => 'Payout details', 'data' => new PayoutResource($payout)]);
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Payout stats',
            'data' => [
                'pending' => Payout::where('status', 'pending')->sum('amount'),
                'processing' => Payout::where('status', 'processing')->sum('amount'),
                'completed_today' => Payout::where('status', 'completed')
                    ->whereDate('updated_at', today())->sum('amount'),
            ],
        ]);
    }
}
