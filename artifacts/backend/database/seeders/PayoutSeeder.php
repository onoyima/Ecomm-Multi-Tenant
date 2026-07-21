<?php

namespace Database\Seeders;

use App\Models\Payout;
use App\Models\Vendor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PayoutSeeder extends Seeder
{
    public function run(): void
    {
        $kicksVendor = Vendor::where('shop_name', 'Kicks Hub NG')->first();
        $techVendor = Vendor::where('shop_name', 'TechMall NG')->first();
        $adaezeVendor = Vendor::where('shop_name', 'Adaeze Fashion Hub')->first();
        $homeVendor = Vendor::where('shop_name', 'HomeGoods NG')->first();
        $luxuryVendor = Vendor::where('shop_name', 'Luxury Time NG')->first();
        $naijaVendor = Vendor::where('shop_name', 'Naija Bites')->first();
        $kidsVendor = Vendor::where('shop_name', 'Kids Paradise')->first();

        $payouts = [
            [
                'vendor_id' => $kicksVendor->id,
                'amount' => 385000,
                'status' => 'completed',
                'payment_method' => 'bank_transfer',
                'reference' => 'POF-' . Str::random(8),
                'bank_name' => 'GTBank',
                'account_number' => '0123456789',
                'account_name' => 'Kicks Hub NG',
                'processed_at' => now()->subDays(1),
            ],
            [
                'vendor_id' => $techVendor->id,
                'amount' => 1250000,
                'status' => 'completed',
                'payment_method' => 'bank_transfer',
                'reference' => 'POF-' . Str::random(8),
                'bank_name' => 'Access Bank',
                'account_number' => '0234567890',
                'account_name' => 'TechMall NG',
                'processed_at' => now()->subDays(2),
            ],
            [
                'vendor_id' => $adaezeVendor->id,
                'amount' => 124500,
                'status' => 'completed',
                'payment_method' => 'bank_transfer',
                'reference' => 'POF-' . Str::random(8),
                'bank_name' => 'First Bank',
                'account_number' => '0345678901',
                'account_name' => 'Adaeze Fashion Hub',
                'processed_at' => now()->subDays(3),
            ],
            [
                'vendor_id' => $kicksVendor->id,
                'amount' => 220000,
                'status' => 'processing',
                'payment_method' => 'bank_transfer',
                'reference' => 'POF-' . Str::random(8),
                'bank_name' => 'GTBank',
                'account_number' => '0123456789',
                'account_name' => 'Kicks Hub NG',
            ],
            [
                'vendor_id' => $techVendor->id,
                'amount' => 890000,
                'status' => 'processing',
                'payment_method' => 'bank_transfer',
                'reference' => 'POF-' . Str::random(8),
                'bank_name' => 'Access Bank',
                'account_number' => '0234567890',
                'account_name' => 'TechMall NG',
            ],
            [
                'vendor_id' => $homeVendor->id,
                'amount' => 185000,
                'status' => 'processing',
                'payment_method' => 'bank_transfer',
                'reference' => 'POF-' . Str::random(8),
                'bank_name' => 'UBA',
                'account_number' => '0456789012',
                'account_name' => 'HomeGoods NG',
            ],
            [
                'vendor_id' => $luxuryVendor->id,
                'amount' => 450000,
                'status' => 'processing',
                'payment_method' => 'bank_transfer',
                'reference' => 'POF-' . Str::random(8),
                'bank_name' => 'Zenith Bank',
                'account_number' => '0567890123',
                'account_name' => 'Luxury Time NG',
            ],
            [
                'vendor_id' => $naijaVendor->id,
                'amount' => 98000,
                'status' => 'pending',
                'payment_method' => 'bank_transfer',
                'reference' => 'POF-' . Str::random(8),
                'bank_name' => 'GTBank',
                'account_number' => '0678901234',
                'account_name' => 'Naija Bites',
            ],
            [
                'vendor_id' => $kidsVendor->id,
                'amount' => 45000,
                'status' => 'pending',
                'payment_method' => 'bank_transfer',
                'reference' => 'POF-' . Str::random(8),
                'bank_name' => 'First Bank',
                'account_number' => '0789012345',
                'account_name' => 'Kids Paradise',
            ],
            [
                'vendor_id' => $adaezeVendor->id,
                'amount' => 150000,
                'status' => 'pending',
                'payment_method' => 'bank_transfer',
                'reference' => 'POF-' . Str::random(8),
                'bank_name' => 'First Bank',
                'account_number' => '0345678901',
                'account_name' => 'Adaeze Fashion Hub',
            ],
        ];

        foreach ($payouts as $data) {
            Payout::create([
                'id' => Str::uuid(),
                'vendor_id' => $data['vendor_id'],
                'amount' => $data['amount'],
                'status' => $data['status'],
                'payment_method' => $data['payment_method'],
                'reference' => $data['reference'],
                'bank_name' => $data['bank_name'],
                'account_number' => $data['account_number'],
                'account_name' => $data['account_name'],
                'processed_at' => $data['processed_at'] ?? null,
            ]);
        }
    }
}
