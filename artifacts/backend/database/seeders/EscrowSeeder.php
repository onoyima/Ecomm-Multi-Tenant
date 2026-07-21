<?php

namespace Database\Seeders;

use App\Models\Escrow;
use App\Models\Order;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class EscrowSeeder extends Seeder
{
    public function run(): void
    {
        $customer = User::where('email', 'customer@demo.com')->first();
        $kicksVendor = Vendor::where('shop_name', 'Kicks Hub NG')->first();
        $techVendor = Vendor::where('shop_name', 'TechMall NG')->first();
        $adaezeVendor = Vendor::where('shop_name', 'Adaeze Fashion Hub')->first();
        $glowVendor = Vendor::where('shop_name', 'GlowUp Beauty')->first();
        $homeVendor = Vendor::where('shop_name', 'HomeGoods NG')->first();

        $kicksUser = User::find($kicksVendor->user_id);
        $techUser = User::find($techVendor->user_id);
        $adaezeUser = User::find($adaezeVendor->user_id);
        $glowUser = User::find($glowVendor->user_id);
        $homeUser = User::find($homeVendor->user_id);

        // Find existing orders by their associated products
        $order1 = Order::whereHas('items', fn($q) => $q->where('title', 'Nike Air Max 270'))->first();
        $order3 = Order::whereHas('items', fn($q) => $q->where('title', 'Smart Watch Series 8'))->first();
        $order4 = Order::whereHas('items', fn($q) => $q->where('title', 'Portable Bluetooth Speaker'))->first();

        // Additional orders for escrows that need them
        $disputedOrder = Order::create([
            'id' => Str::uuid(),
            'customer_id' => $customer->id,
            'status' => 'disputed',
            'payment_status' => 'paid',
            'payment_method' => 'paystack',
            'paystack_reference' => 'paystack_ref_disp',
            'subtotal' => 320000,
            'shipping_fee' => 2500,
            'total' => 322500,
            'shipping_address' => '15 Banana Island Road, Ikoyi, Lagos',
        ]);

        $adaezeOrder = Order::create([
            'id' => Str::uuid(),
            'customer_id' => $customer->id,
            'status' => 'processing',
            'payment_status' => 'paid',
            'payment_method' => 'paystack',
            'paystack_reference' => 'paystack_ref_ada',
            'subtotal' => 450000,
            'shipping_fee' => 2500,
            'total' => 452500,
            'shipping_address' => '15 Banana Island Road, Ikoyi, Lagos',
        ]);

        $glowOrder = Order::create([
            'id' => Str::uuid(),
            'customer_id' => $customer->id,
            'status' => 'delivered',
            'payment_status' => 'paid',
            'payment_method' => 'wallet',
            'subtotal' => 12500,
            'shipping_fee' => 0,
            'total' => 12500,
            'shipping_address' => '15 Banana Island Road, Ikoyi, Lagos',
        ]);

        $homeOrder = Order::create([
            'id' => Str::uuid(),
            'customer_id' => $customer->id,
            'status' => 'processing',
            'payment_status' => 'paid',
            'payment_method' => 'paystack',
            'paystack_reference' => 'paystack_ref_home',
            'subtotal' => 185000,
            'shipping_fee' => 2500,
            'total' => 187500,
            'shipping_address' => '15 Banana Island Road, Ikoyi, Lagos',
        ]);

        $techOrder2 = Order::create([
            'id' => Str::uuid(),
            'customer_id' => $customer->id,
            'status' => 'delivered',
            'payment_status' => 'paid',
            'payment_method' => 'paystack',
            'paystack_reference' => 'paystack_ref_tech2',
            'subtotal' => 95000,
            'shipping_fee' => 2500,
            'total' => 97500,
            'shipping_address' => '15 Banana Island Road, Ikoyi, Lagos',
        ]);

        $escrows = [
            [
                'id' => Str::uuid(),
                'order_id' => $order1->id,
                'buyer_id' => $customer->id,
                'seller_id' => $kicksUser->id,
                'amount' => 85000,
                'platform_fee' => 8500,
                'vendor_amount' => 76500,
                'status' => 'held',
            ],
            [
                'id' => Str::uuid(),
                'order_id' => $order3->id,
                'buyer_id' => $customer->id,
                'seller_id' => $techUser->id,
                'amount' => 75000,
                'platform_fee' => 7500,
                'vendor_amount' => 67500,
                'status' => 'held',
            ],
            [
                'id' => Str::uuid(),
                'order_id' => $disputedOrder->id,
                'buyer_id' => $customer->id,
                'seller_id' => $kicksUser->id,
                'amount' => 320000,
                'platform_fee' => 32000,
                'vendor_amount' => 288000,
                'status' => 'disputed',
            ],
            [
                'id' => Str::uuid(),
                'order_id' => $order4->id,
                'buyer_id' => $customer->id,
                'seller_id' => $techUser->id,
                'amount' => 28000,
                'platform_fee' => 2800,
                'vendor_amount' => 25200,
                'status' => 'held',
            ],
            [
                'id' => Str::uuid(),
                'order_id' => $adaezeOrder->id,
                'buyer_id' => $customer->id,
                'seller_id' => $adaezeUser->id,
                'amount' => 450000,
                'platform_fee' => 45000,
                'vendor_amount' => 405000,
                'status' => 'partially_released',
                'released_at' => now()->subDays(2),
                'released_by' => 'Emeka Admin',
            ],
            [
                'id' => Str::uuid(),
                'order_id' => $glowOrder->id,
                'buyer_id' => $customer->id,
                'seller_id' => $glowUser->id,
                'amount' => 12500,
                'platform_fee' => 1250,
                'vendor_amount' => 11250,
                'status' => 'released',
                'released_at' => now()->subDays(5),
                'released_by' => 'Emeka Admin',
            ],
            [
                'id' => Str::uuid(),
                'order_id' => $homeOrder->id,
                'buyer_id' => $customer->id,
                'seller_id' => $homeUser->id,
                'amount' => 185000,
                'platform_fee' => 18500,
                'vendor_amount' => 166500,
                'status' => 'held',
            ],
            [
                'id' => Str::uuid(),
                'order_id' => $techOrder2->id,
                'buyer_id' => $customer->id,
                'seller_id' => $techUser->id,
                'amount' => 95000,
                'platform_fee' => 9500,
                'vendor_amount' => 85500,
                'status' => 'released',
                'released_at' => now()->subDays(3),
                'released_by' => 'Emeka Admin',
            ],
        ];

        foreach ($escrows as $data) {
            Escrow::create($data);
        }
    }
}
