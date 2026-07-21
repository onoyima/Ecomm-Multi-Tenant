<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PlatformWalletController extends Controller
{
    use FlattensPagination;

    private function getPlatformWallet(): Wallet
    {
        $admin = User::where('role', 'admin')->orderBy('id')->first();
        if (!$admin) {
            abort(404, 'Platform wallet not configured');
        }
        return $admin->wallet ?? Wallet::create(['user_id' => $admin->id, 'balance' => 0]);
    }

    public function balance(): JsonResponse
    {
        $wallet = $this->getPlatformWallet();
        return response()->json(['success' => true, 'message' => 'Platform wallet balance', 'data' => [
            'balance' => $wallet->balance,
            'currency' => $wallet->currency ?? 'NGN',
        ]]);
    }

    public function transactions(Request $req): JsonResponse
    {
        $wallet = $this->getPlatformWallet();
        $transactions = $wallet->transactions()
            ->orderBy('created_at', 'desc')
            ->paginate($req->per_page ?? 15);

        return $this->paginatedResponse($transactions, 'Platform wallet transactions');
    }

    public function transferToVendor(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'amount' => 'required|numeric|min:1',
            'description' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            $platformWallet = $this->getPlatformWallet();

            if ($platformWallet->balance < $validated['amount']) {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Insufficient platform balance', 'data' => null], 422);
            }

            $vendor = \App\Models\Vendor::findOrFail($validated['vendor_id']);
            $vendorWallet = $vendor->user->wallet ?? Wallet::create(['user_id' => $vendor->user_id, 'balance' => 0]);

            $description = $validated['description'] ?? "Transfer from platform to vendor {$vendor->shop_name}";

            $platformWallet->decrement('balance', $validated['amount']);
            Transaction::create([
                'wallet_id' => $platformWallet->id,
                'type' => 'transfer',
                'amount' => -$validated['amount'],
                'description' => $description,
                'status' => 'completed',
            ]);

            $vendorWallet->increment('balance', $validated['amount']);
            Transaction::create([
                'wallet_id' => $vendorWallet->id,
                'type' => 'transfer',
                'amount' => $validated['amount'],
                'description' => "Credit from platform",
                'status' => 'completed',
            ]);

            DB::commit();

            return response()->json(['success' => true, 'message' => 'Transfer completed', 'data' => [
                'amount' => $validated['amount'],
                'vendor' => $vendor->shop_name,
                'platform_balance' => $platformWallet->fresh()->balance,
            ]]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage(), 'data' => null], 500);
        }
    }
}
