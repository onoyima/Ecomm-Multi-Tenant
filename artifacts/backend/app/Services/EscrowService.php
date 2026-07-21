<?php
namespace App\Services;
use App\Models\Escrow;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EscrowService
{
    protected float $platformFeePercent = 2.5;

    public function createEscrow(array $data): Escrow
    {
        return DB::transaction(function () use ($data) {
            $fee = (int) round($data['amount'] * $this->platformFeePercent / 100);
            return Escrow::create([
                'order_id' => $data['order_id'],
                'buyer_id' => $data['buyer_id'],
                'seller_id' => $data['seller_id'],
                'amount' => $data['amount'],
                'platform_fee' => $fee,
                'vendor_amount' => $data['amount'] - $fee,
                'status' => 'held',
            ]);
        });
    }

    public function releaseFunds(Escrow $escrow, string $releasedBy = 'system'): bool
    {
        return DB::transaction(function () use ($escrow, $releasedBy) {
            $escrow->update(['status' => 'released', 'released_at' => now(), 'released_by' => $releasedBy]);
            $sellerWallet = $escrow->seller->wallet;
            if ($sellerWallet) {
                $sellerWallet->balance += $escrow->vendor_amount;
                $sellerWallet->save();
                Transaction::create([
                    'wallet_id' => $sellerWallet->id,
                    'type' => 'credit',
                    'amount' => $escrow->vendor_amount,
                    'description' => "Escrow release for order #{$escrow->order_id}",
                    'reference' => "ESC-REL-{$escrow->id}",
                ]);
            }
            return true;
        });
    }

    public function partiallyRelease(Escrow $escrow, int $amount, string $releasedBy = 'system'): bool
    {
        return DB::transaction(function () use ($escrow, $amount, $releasedBy) {
            $remaining = $escrow->vendor_amount - $amount;
            $escrow->update([
                'status' => $remaining > 0 ? 'partially_released' : 'released',
                'vendor_amount' => $remaining,
                'released_at' => now(),
                'released_by' => $releasedBy,
            ]);
            $sellerWallet = $escrow->seller->wallet;
            if ($sellerWallet) {
                $sellerWallet->balance += $amount;
                $sellerWallet->save();
            }
            return true;
        });
    }

    public function calculateFee(int $amount): array
    {
        $fee = (int) round($amount * $this->platformFeePercent / 100);
        $vendorShare = $amount - $fee;
        $platformShare = $fee;
        return [
            'total' => $amount,
            'fee_percent' => $this->platformFeePercent,
            'fee' => $fee,
            'vendor_share' => $vendorShare,
            'platform_share' => $platformShare,
        ];
    }
}
