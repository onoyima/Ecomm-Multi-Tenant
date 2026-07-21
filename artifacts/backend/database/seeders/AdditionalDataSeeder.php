<?php

namespace Database\Seeders;

use App\Models\CommissionTier;
use App\Models\Dispute;
use App\Models\DropshipRequest;
use App\Models\FraudAlert;
use App\Models\Notification;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AdditionalDataSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@demo.com')->first();
        $customer = User::where('email', 'customer@demo.com')->first();
        $kicksVendor = Vendor::where('shop_name', 'Kicks Hub NG')->first();
        $techVendor = Vendor::where('shop_name', 'TechMall NG')->first();
        $adaezeVendor = Vendor::where('shop_name', 'Adaeze Fashion Hub')->first();
        $homeVendor = Vendor::where('shop_name', 'HomeGoods NG')->first();
        $fitVendor = Vendor::where('shop_name', 'FitLife Store')->first();
        $luxuryVendor = Vendor::where('shop_name', 'Luxury Time NG')->first();
        $naijaVendor = Vendor::where('shop_name', 'Naija Bites')->first();

        $products = Product::pluck('id', 'title');

        // ─── Fraud Alerts ───────────────────────────────────────────────────
        $fraudAlerts = [
            [
                'transaction_id' => 'TXN-' . Str::random(8),
                'amount' => 450000,
                'risk_score' => 92,
                'risk_level' => 'high',
                'reason' => 'Unusual large purchase from new account',
                'description' => 'Customer made a purchase of ₦450,000 within 5 minutes of account creation from an unusual IP address.',
                'customer_name' => 'Chidi Okafor',
                'status' => 'blocked',
                'action_taken' => 'Order blocked and account flagged for manual review',
                'actioned_by' => $admin->id,
            ],
            [
                'transaction_id' => 'TXN-' . Str::random(8),
                'amount' => 320000,
                'risk_score' => 85,
                'risk_level' => 'high',
                'reason' => 'Multiple failed payment attempts',
                'description' => 'Customer attempted 5 different cards in 10 minutes, all declined. Pattern matches known fraud behavior.',
                'customer_name' => 'Ngozi Adeyemi',
                'status' => 'flagged',
            ],
            [
                'transaction_id' => 'TXN-' . Str::random(8),
                'amount' => 125000,
                'risk_score' => 72,
                'risk_level' => 'medium',
                'reason' => 'Shipping address mismatch',
                'description' => 'IP geolocation shows Lagos, but shipping address is in Kano. Billing address is in Port Harcourt.',
                'customer_name' => 'Ahmed Bello',
                'status' => 'flagged',
            ],
            [
                'transaction_id' => 'TXN-' . Str::random(8),
                'amount' => 85000,
                'risk_score' => 65,
                'risk_level' => 'medium',
                'reason' => 'Rapid order frequency',
                'description' => 'Customer placed 3 orders within 60 seconds, totaling ₦255,000. Pattern suggests automated script.',
                'customer_name' => 'Blessing Tech Store',
                'status' => 'reviewed',
                'action_taken' => 'Orders verified as legitimate business purchases',
                'actioned_by' => $admin->id,
            ],
            [
                'transaction_id' => 'TXN-' . Str::random(8),
                'amount' => 12000,
                'risk_score' => 88,
                'risk_level' => 'high',
                'reason' => 'Stolen card indicators',
                'description' => 'Card used matches stolen card database. CVV match but AVS failed. Multiple high-value attempts.',
                'customer_name' => 'Tunde Bello',
                'status' => 'blocked',
                'action_taken' => 'Transaction declined and card reported',
                'actioned_by' => $admin->id,
            ],
            [
                'transaction_id' => 'TXN-' . Str::random(8),
                'amount' => 35000,
                'risk_score' => 45,
                'risk_level' => 'low',
                'reason' => 'New device detected',
                'description' => 'Customer logged in from a new device. Previous orders were all delivered successfully.',
                'customer_name' => 'Chidi Okafor',
                'status' => 'cleared',
                'action_taken' => '2FA challenge passed, transaction approved',
                'actioned_by' => $admin->id,
            ],
            [
                'transaction_id' => 'TXN-' . Str::random(8),
                'amount' => 280000,
                'risk_score' => 78,
                'risk_level' => 'medium',
                'reason' => 'Unusual shipping pattern',
                'description' => 'Customer shipping to a freight forwarding address. Multiple high-value items to same address.',
                'customer_name' => 'Grace Mohammed',
                'status' => 'flagged',
            ],
            [
                'transaction_id' => 'TXN-' . Str::random(8),
                'amount' => 185000,
                'risk_score' => 55,
                'risk_level' => 'low',
                'reason' => 'Price sensitive query',
                'description' => 'Customer added and removed items 15+ times before checkout. Price comparison behavior detected.',
                'customer_name' => 'Oluwaseun Adeleke',
                'status' => 'cleared',
                'action_taken' => 'Normal shopping behavior, no action needed',
                'actioned_by' => $admin->id,
            ],
            [
                'transaction_id' => 'TXN-' . Str::random(8),
                'amount' => 65000,
                'risk_score' => 90,
                'risk_level' => 'high',
                'reason' => 'Chargeback history',
                'description' => 'Customer has 3 previous chargebacks on other platforms. Email domain flagged as temporary.',
                'customer_name' => 'Emeka Nwosu',
                'status' => 'blocked',
                'action_taken' => 'Account suspended pending identity verification',
                'actioned_by' => $admin->id,
            ],
            [
                'transaction_id' => 'TXN-' . Str::random(8),
                'amount' => 95000,
                'risk_score' => 35,
                'risk_level' => 'low',
                'reason' => 'International IP detected',
                'description' => 'Customer accessing from UK IP but local Nigerian account. No other risk indicators.',
                'customer_name' => 'Chinedu Obi',
                'status' => 'cleared',
                'action_taken' => 'Customer verified via phone, transaction cleared',
                'actioned_by' => $admin->id,
            ],
        ];

        foreach ($fraudAlerts as $data) {
            FraudAlert::create([
                'id' => Str::uuid(),
                'transaction_id' => $data['transaction_id'],
                'amount' => $data['amount'],
                'risk_score' => $data['risk_score'],
                'risk_level' => $data['risk_level'],
                'reason' => $data['reason'],
                'description' => $data['description'],
                'customer_name' => $data['customer_name'],
                'status' => $data['status'],
                'action_taken' => $data['action_taken'] ?? null,
                'actioned_by' => $data['actioned_by'] ?? null,
            ]);
        }

        // ─── Commission Tiers ──────────────────────────────────────────────
        $tiers = [
            ['name' => 'New', 'rate' => 15.00, 'min_orders' => 0, 'min_revenue' => 0, 'vendor_count' => 3],
            ['name' => 'Established', 'rate' => 10.00, 'min_orders' => 50, 'min_revenue' => 500000, 'vendor_count' => 4],
            ['name' => 'Top', 'rate' => 5.00, 'min_orders' => 200, 'min_revenue' => 5000000, 'vendor_count' => 2],
        ];

        foreach ($tiers as $data) {
            CommissionTier::create([
                'id' => Str::uuid(),
                'name' => $data['name'],
                'rate' => $data['rate'],
                'min_orders' => $data['min_orders'],
                'min_revenue' => $data['min_revenue'],
                'vendor_count' => $data['vendor_count'],
            ]);
        }

        // ─── Notifications (for customer) ──────────────────────────────────
        $nikeOrder = Order::whereHas('items', fn($q) => $q->where('title', 'Nike Air Max 270'))->first();
        $dressOrder = Order::whereHas('items', fn($q) => $q->where('title', 'Adidas Floral Summer Dress'))->first();
        $watchOrder = Order::whereHas('items', fn($q) => $q->where('title', 'Smart Watch Series 8'))->first();

        $notifications = [
            [
                'type' => 'order',
                'title' => 'Order Shipped',
                'description' => 'Your Nike Air Max 270 has been shipped via DHL Express.',
                'data' => ['order_id' => $nikeOrder->id, 'status' => 'shipped'],
                'created_at' => now()->subDays(2),
            ],
            [
                'type' => 'order',
                'title' => 'Order Delivered',
                'description' => 'Your Adidas Floral Summer Dress order has been delivered successfully.',
                'data' => ['order_id' => $dressOrder->id, 'status' => 'delivered'],
                'created_at' => now()->subDays(5),
            ],
            [
                'type' => 'payment',
                'title' => 'Payment Confirmed',
                'description' => 'Payment of ₦75,000 for Smart Watch Series 8 has been confirmed.',
                'data' => ['order_id' => $watchOrder->id, 'amount' => 75000],
                'created_at' => now()->subDays(1),
            ],
            [
                'type' => 'order',
                'title' => 'Order Processing',
                'description' => 'Your order for Smart Watch Series 8 is now being processed.',
                'data' => ['order_id' => $watchOrder->id, 'status' => 'processing'],
                'created_at' => now()->subHours(18),
            ],
            [
                'type' => 'system',
                'title' => 'KYC Update Required',
                'description' => 'Please complete your KYC verification to unlock higher transaction limits.',
                'data' => ['url' => '/settings/kyc'],
                'created_at' => now()->subDays(7),
            ],
            [
                'type' => 'promo',
                'title' => 'Flash Sale: 30% Off',
                'description' => 'Electronics flash sale ends in 24 hours. Grab your deals now!',
                'data' => ['category' => 'Electronics', 'discount' => 30],
                'created_at' => now()->subHours(6),
            ],
            [
                'type' => 'payment',
                'title' => 'Wallet Deposit Received',
                'description' => '₦15,000 has been deposited to your wallet.',
                'data' => ['amount' => 15000, 'method' => 'bank_transfer'],
                'created_at' => now()->subDays(10),
            ],
            [
                'type' => 'promo',
                'title' => 'Free Shipping Weekend',
                'description' => 'Enjoy free shipping on all orders this weekend with code FREESHIP.',
                'data' => ['code' => 'FREESHIP', 'expires' => '2026-05-15'],
                'created_at' => now()->subHours(12),
            ],
        ];

        foreach ($notifications as $data) {
            Notification::create([
                'id' => Str::uuid(),
                'user_id' => $customer->id,
                'type' => $data['type'],
                'title' => $data['title'],
                'description' => $data['description'],
                'data' => $data['data'],
                'read_at' => in_array($data['type'], ['system', 'promo']) ? null : now(),
                'created_at' => $data['created_at'],
            ]);
        }

        // ─── Reviews ───────────────────────────────────────────────────────
        $reviews = [
            [
                'product_id' => $products['Nike Air Max 270'],
                'user_id' => $customer->id,
                'rating' => 5,
                'title' => 'Best sneakers ever!',
                'body' => 'Absolutely love these shoes. Super comfortable and look great. True to size.',
                'is_verified' => true,
            ],
            [
                'product_id' => $products['Adidas Floral Summer Dress'],
                'user_id' => $customer->id,
                'rating' => 4,
                'title' => 'Beautiful dress',
                'body' => 'The fabric is lovely and the fit is perfect. Slightly long for me but overall great quality.',
                'is_verified' => true,
            ],
            [
                'product_id' => $products['Portable Bluetooth Speaker'],
                'user_id' => User::where('email', 'ngozi@example.com')->first()->id,
                'rating' => 5,
                'title' => 'Amazing sound quality',
                'body' => 'Battery lasts forever and the sound is incredible for the size. Worth every naira!',
                'is_verified' => true,
            ],
            [
                'product_id' => $products['Natural Shea Butter 500g'],
                'user_id' => User::where('email', 'tunde@example.com')->first()->id,
                'rating' => 3,
                'title' => 'Good but expensive',
                'body' => 'Good quality shea butter but a bit pricier than my local market. Nice packaging though.',
                'is_verified' => false,
            ],
        ];

        foreach ($reviews as $data) {
            Review::create([
                'id' => Str::uuid(),
                'product_id' => $data['product_id'],
                'user_id' => $data['user_id'],
                'rating' => $data['rating'],
                'title' => $data['title'],
                'body' => $data['body'],
                'is_verified' => $data['is_verified'],
            ]);
        }

        // ─── Disputes ──────────────────────────────────────────────────────
        // Find the disputed order created by EscrowSeeder (status=disputed, total=322500)
        $orderDisp1 = Order::where('status', 'disputed')->where('total', 322500)->first();

        // Create additional dispute orders with UUIDs
        $orderDisp2 = Order::create([
            'id' => Str::uuid(),
            'customer_id' => $customer->id,
            'status' => 'refunded',
            'payment_status' => 'refunded',
            'payment_method' => 'paystack',
            'subtotal' => 12500,
            'shipping_fee' => 0,
            'total' => 12500,
            'shipping_address' => '15 Banana Island Road, Ikoyi, Lagos',
        ]);

        $orderDisp3 = Order::create([
            'id' => Str::uuid(),
            'customer_id' => $customer->id,
            'status' => 'cancelled',
            'payment_status' => 'refunded',
            'payment_method' => 'wallet',
            'subtotal' => 45000,
            'shipping_fee' => 2500,
            'total' => 47500,
            'shipping_address' => '15 Banana Island Road, Ikoyi, Lagos',
        ]);

        $orderDisp4 = Order::create([
            'id' => Str::uuid(),
            'customer_id' => $customer->id,
            'status' => 'disputed',
            'payment_status' => 'paid',
            'payment_method' => 'paystack',
            'subtotal' => 185000,
            'shipping_fee' => 2500,
            'total' => 187500,
            'shipping_address' => '15 Banana Island Road, Ikoyi, Lagos',
        ]);

        $disputes = [
            [
                'order_id' => $orderDisp1->id,
                'customer_id' => $customer->id,
                'vendor_id' => $kicksVendor->user_id,
                'subject' => 'Wrong item delivered',
                'description' => 'I ordered Jordan 1 Retro High OG but received a different, clearly fake pair of sneakers. The box was also damaged.',
                'status' => 'open',
            ],
            [
                'order_id' => $orderDisp2->id,
                'customer_id' => $customer->id,
                'vendor_id' => $glowVendor = Vendor::where('shop_name', 'GlowUp Beauty')->first()->user_id,
                'subject' => 'Product expired',
                'description' => 'Received face serum that expired 3 months ago. The packaging was sealed but the expiration date was clearly visible.',
                'status' => 'resolved',
                'resolution' => 'Full refund issued. Vendor warned about inventory management.',
                'resolved_by' => $admin->id,
            ],
            [
                'order_id' => $orderDisp3->id,
                'customer_id' => $customer->id,
                'vendor_id' => $adaezeVendor->user_id,
                'subject' => 'Wrong size delivered',
                'description' => 'Ordered XXL Agbada but received M size. The item was clearly mislabeled on the website.',
                'status' => 'resolved',
                'resolution' => 'Return initiated and correct size shipped. Vendor to update size chart.',
                'resolved_by' => $admin->id,
            ],
            [
                'order_id' => $orderDisp4->id,
                'customer_id' => $customer->id,
                'vendor_id' => $homeVendor->user_id,
                'subject' => 'Damaged upon arrival',
                'description' => 'The travel luggage set arrived with a cracked shell and broken zipper. The outer box was also damaged suggesting rough handling.',
                'status' => 'open',
            ],
        ];

        foreach ($disputes as $data) {
            Dispute::create([
                'id' => Str::uuid(),
                'order_id' => $data['order_id'],
                'customer_id' => $data['customer_id'],
                'vendor_id' => $data['vendor_id'],
                'subject' => $data['subject'],
                'description' => $data['description'],
                'status' => $data['status'],
                'resolution' => $data['resolution'] ?? null,
                'resolved_by' => $data['resolved_by'] ?? null,
            ]);
        }

        // ─── Dropship Requests ─────────────────────────────────────────────
        $dropshipRequests = [
            [
                'vendor_id' => $kicksVendor->id,
                'source_url' => 'https://www.alibaba.com/product/sport-shoes-123',
                'title' => 'Running Shoes Bulk',
                'supplier_price' => 12000,
                'selling_price' => 35000,
                'markup_percent' => 65,
                'category' => 'Shoes',
                'images' => ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'],
                'ai_processed_data' => [
                    'market_price' => 38000,
                    'demand_score' => 85,
                    'competition_level' => 'medium',
                    'suggested_price' => 35000,
                    'profit_margin' => 65,
                    'trending' => true,
                ],
                'status' => 'approved',
                'supplier_name' => 'Shenzhen Sports Co.',
                'estimated_delivery' => '14-21 days',
                'ai_score' => 85,
            ],
            [
                'vendor_id' => $techVendor->id,
                'source_url' => 'https://www.alibaba.com/product/wireless-earbuds-456',
                'title' => 'Wireless Earbuds ANC',
                'supplier_price' => 8500,
                'selling_price' => 22000,
                'markup_percent' => 61,
                'category' => 'Electronics',
                'images' => ['https://images.unsplash.com/photo-1590658268037-6bf12f032f75?w=400'],
                'ai_processed_data' => [
                    'market_price' => 25000,
                    'demand_score' => 92,
                    'competition_level' => 'high',
                    'suggested_price' => 22000,
                    'profit_margin' => 61,
                    'trending' => true,
                ],
                'status' => 'approved',
                'supplier_name' => 'Shenzhen Tech Co.',
                'estimated_delivery' => '10-15 days',
                'ai_score' => 92,
            ],
            [
                'vendor_id' => $homeVendor->id,
                'source_url' => 'https://www.alibaba.com/product/kitchen-set-789',
                'title' => 'Non-Stick Cookware Set',
                'supplier_price' => 25000,
                'selling_price' => 55000,
                'markup_percent' => 55,
                'category' => 'Home',
                'images' => ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'],
                'ai_processed_data' => [
                    'market_price' => 60000,
                    'demand_score' => 78,
                    'competition_level' => 'low',
                    'suggested_price' => 55000,
                    'profit_margin' => 55,
                    'trending' => false,
                ],
                'status' => 'pending',
                'supplier_name' => 'Guangzhou Home Goods',
                'estimated_delivery' => '14-20 days',
                'ai_score' => 78,
            ],
            [
                'vendor_id' => $fitVendor->id,
                'source_url' => 'https://www.alibaba.com/product/yoga-mat-101',
                'title' => 'Premium Yoga Mat 8mm',
                'supplier_price' => 3500,
                'selling_price' => 9500,
                'markup_percent' => 63,
                'category' => 'Sports',
                'images' => ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400'],
                'ai_processed_data' => [
                    'market_price' => 10000,
                    'demand_score' => 70,
                    'competition_level' => 'medium',
                    'suggested_price' => 9500,
                    'profit_margin' => 63,
                    'trending' => false,
                ],
                'status' => 'rejected',
                'supplier_name' => 'Yiwu Sports Equipment',
                'estimated_delivery' => '12-18 days',
                'ai_score' => 70,
            ],
            [
                'vendor_id' => $naijaVendor->id,
                'source_url' => 'https://www.alibaba.com/product/paper-bags-202',
                'title' => 'Custom Food Packaging',
                'supplier_price' => 1800,
                'selling_price' => 4500,
                'markup_percent' => 60,
                'category' => 'Food',
                'images' => ['https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400'],
                'ai_processed_data' => [
                    'market_price' => 5000,
                    'demand_score' => 65,
                    'competition_level' => 'low',
                    'suggested_price' => 4500,
                    'profit_margin' => 60,
                    'trending' => false,
                ],
                'status' => 'pending',
                'supplier_name' => 'Shenzhen Packaging Co.',
                'estimated_delivery' => '10-14 days',
                'ai_score' => 65,
            ],
        ];

        foreach ($dropshipRequests as $data) {
            DropshipRequest::create([
                'id' => Str::uuid(),
                'vendor_id' => $data['vendor_id'],
                'source_url' => $data['source_url'],
                'title' => $data['title'],
                'supplier_price' => $data['supplier_price'],
                'selling_price' => $data['selling_price'],
                'markup_percent' => $data['markup_percent'],
                'category' => $data['category'],
                'images' => $data['images'],
                'ai_processed_data' => $data['ai_processed_data'],
                'status' => $data['status'],
                'supplier_name' => $data['supplier_name'],
                'estimated_delivery' => $data['estimated_delivery'],
                'ai_score' => $data['ai_score'],
            ]);
        }
    }
}
