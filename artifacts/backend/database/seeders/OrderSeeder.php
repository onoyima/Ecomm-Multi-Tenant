<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $customer = User::where('email', 'customer@demo.com')->first();
        $nike = Product::where('title', 'Nike Air Max 270')->first();
        $dress = Product::where('title', 'Adidas Floral Summer Dress')->first();
        $bottle = Product::where('title', 'Stainless Steel Water Bottle 1L')->first();
        $watch = Product::where('title', 'Smart Watch Series 8')->first();
        $speaker = Product::where('title', 'Portable Bluetooth Speaker')->first();

        $kicksVendor = Vendor::where('shop_name', 'Kicks Hub NG')->first()->id;
        $adaezeVendor = Vendor::where('shop_name', 'Adaeze Fashion Hub')->first()->id;
        $homeVendor = Vendor::where('shop_name', 'HomeGoods NG')->first()->id;
        $techVendor = Vendor::where('shop_name', 'TechMall NG')->first()->id;

        // ord-001
        $order1 = Order::create([
            'id' => Str::uuid(),
            'customer_id' => $customer->id,
            'status' => 'shipped',
            'payment_status' => 'paid',
            'payment_method' => 'paystack',
            'paystack_reference' => 'paystack_ref_' . Str::random(10),
            'subtotal' => 85000,
            'shipping_fee' => 2500,
            'total' => 85000,
            'shipping_address' => '15 Banana Island Road, Ikoyi, Lagos',
            'tracking_number' => 'DHL9876543210NG',
            'carrier' => 'DHL Express',
            'estimated_delivery' => 'May 14, 2026',
        ]);

        OrderItem::create([
            'id' => Str::uuid(),
            'order_id' => $order1->id,
            'product_id' => $nike->id,
            'vendor_id' => $kicksVendor,
            'title' => 'Nike Air Max 270',
            'image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
            'price' => 85000,
            'qty' => 1,
        ]);

        // ord-002
        $order2 = Order::create([
            'id' => Str::uuid(),
            'customer_id' => $customer->id,
            'status' => 'delivered',
            'payment_status' => 'paid',
            'payment_method' => 'wallet',
            'subtotal' => 42800,
            'shipping_fee' => 0,
            'total' => 63500,
            'shipping_address' => '15 Banana Island Road, Ikoyi, Lagos',
            'tracking_number' => 'GIG8834729017NG',
            'carrier' => 'GIG Logistics',
        ]);

        OrderItem::create([
            'id' => Str::uuid(),
            'order_id' => $order2->id,
            'product_id' => $dress->id,
            'vendor_id' => $adaezeVendor,
            'title' => 'Adidas Floral Summer Dress',
            'image' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
            'price' => 18500,
            'qty' => 2,
        ]);

        OrderItem::create([
            'id' => Str::uuid(),
            'order_id' => $order2->id,
            'product_id' => $bottle->id,
            'vendor_id' => $homeVendor,
            'title' => 'Stainless Steel Water Bottle',
            'image' => 'https://images.unsplash.com/photo-1581553680321-4fffae59fccd?w=400',
            'price' => 5800,
            'qty' => 1,
        ]);

        // ord-003
        $order3 = Order::create([
            'id' => Str::uuid(),
            'customer_id' => $customer->id,
            'status' => 'processing',
            'payment_status' => 'paid',
            'payment_method' => 'paystack',
            'paystack_reference' => 'paystack_ref_' . Str::random(10),
            'subtotal' => 75000,
            'shipping_fee' => 2500,
            'total' => 75000,
            'shipping_address' => '15 Banana Island Road, Ikoyi, Lagos',
            'estimated_delivery' => 'May 17, 2026',
        ]);

        OrderItem::create([
            'id' => Str::uuid(),
            'order_id' => $order3->id,
            'product_id' => $watch->id,
            'vendor_id' => $techVendor,
            'title' => 'Smart Watch Series 8',
            'image' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
            'price' => 75000,
            'qty' => 1,
        ]);

        // ord-004
        $order4 = Order::create([
            'id' => Str::uuid(),
            'customer_id' => $customer->id,
            'status' => 'pending',
            'payment_status' => 'pending',
            'payment_method' => 'pod',
            'subtotal' => 28000,
            'shipping_fee' => 2500,
            'total' => 28000,
            'shipping_address' => '15 Banana Island Road, Ikoyi, Lagos',
        ]);

        OrderItem::create([
            'id' => Str::uuid(),
            'order_id' => $order4->id,
            'product_id' => $speaker->id,
            'vendor_id' => $techVendor,
            'title' => 'Portable Bluetooth Speaker',
            'image' => 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400',
            'price' => 28000,
            'qty' => 1,
        ]);
    }
}
