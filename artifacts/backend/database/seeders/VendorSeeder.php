<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class VendorSeeder extends Seeder
{
    public function run(): void
    {
        $adaezeUser = User::where('email', 'vendor@demo.com')->first();

        $kicksUser = User::create([
            'id' => Str::uuid(),
            'name' => 'Kicks Hub NG',
            'email' => 'kickshub@demo.com',
            'password' => bcrypt('password'),
            'role' => 'vendor',
            'wallet_balance' => 0,
            'kyc_status' => 'verified',
            'is_active' => true,
        ]);

        $techUser = User::create([
            'id' => Str::uuid(),
            'name' => 'TechMall NG',
            'email' => 'techmall@demo.com',
            'password' => bcrypt('password'),
            'role' => 'vendor',
            'wallet_balance' => 0,
            'kyc_status' => 'verified',
            'is_active' => true,
        ]);

        $glowUser = User::create([
            'id' => Str::uuid(),
            'name' => 'GlowUp Beauty',
            'email' => 'glowup@demo.com',
            'password' => bcrypt('password'),
            'role' => 'vendor',
            'wallet_balance' => 0,
            'kyc_status' => 'pending',
            'is_active' => true,
        ]);

        $homeUser = User::create([
            'id' => Str::uuid(),
            'name' => 'HomeGoods NG',
            'email' => 'homegoods@demo.com',
            'password' => bcrypt('password'),
            'role' => 'vendor',
            'wallet_balance' => 0,
            'kyc_status' => 'verified',
            'is_active' => true,
        ]);

        $fitUser = User::create([
            'id' => Str::uuid(),
            'name' => 'FitLife Store',
            'email' => 'fitlife@demo.com',
            'password' => bcrypt('password'),
            'role' => 'vendor',
            'wallet_balance' => 0,
            'kyc_status' => 'pending',
            'is_active' => true,
        ]);

        $luxuryUser = User::create([
            'id' => Str::uuid(),
            'name' => 'Luxury Time NG',
            'email' => 'luxurytime@demo.com',
            'password' => bcrypt('password'),
            'role' => 'vendor',
            'wallet_balance' => 0,
            'kyc_status' => 'verified',
            'is_active' => true,
        ]);

        $naijaUser = User::create([
            'id' => Str::uuid(),
            'name' => 'Naija Bites',
            'email' => 'naijabites@demo.com',
            'password' => bcrypt('password'),
            'role' => 'vendor',
            'wallet_balance' => 0,
            'kyc_status' => 'verified',
            'is_active' => true,
        ]);

        $kidsUser = User::create([
            'id' => Str::uuid(),
            'name' => 'Kids Paradise',
            'email' => 'kidsparadise@demo.com',
            'password' => bcrypt('password'),
            'role' => 'vendor',
            'wallet_balance' => 0,
            'kyc_status' => 'verified',
            'is_active' => true,
        ]);

        $adaezeVendor = Vendor::create([
            'id' => Str::uuid(),
            'user_id' => $adaezeUser->id,
            'shop_name' => 'Adaeze Fashion Hub',
            'shop_description' => 'Premium African fashion and accessories. Your number one destination for Ankara styles, agbada sets, and contemporary African wear.',
            'status' => 'approved',
            'commission_rate' => 10.00,
            'total_revenue' => 1247500,
            'total_orders' => 148,
            'total_products' => 24,
            'rating' => 4.60,
            'fraud_score' => 87,
            'verification_status' => 'verified',
        ]);

        $kicksVendor = Vendor::create([
            'id' => Str::uuid(),
            'user_id' => $kicksUser->id,
            'shop_name' => 'Kicks Hub NG',
            'shop_description' => 'Authentic sneakers and footwear. We bring you the best kicks from Nike, Adidas, Jordan, and more.',
            'status' => 'approved',
            'commission_rate' => 8.00,
            'total_revenue' => 3824000,
            'total_orders' => 412,
            'total_products' => 34,
            'rating' => 4.80,
            'fraud_score' => 92,
            'verification_status' => 'verified',
        ]);

        $techVendor = Vendor::create([
            'id' => Str::uuid(),
            'user_id' => $techUser->id,
            'shop_name' => 'TechMall NG',
            'shop_description' => 'Nigeria\'s top electronics retailer. Phones, laptops, TVs, smart home devices, and gadgets at unbeatable prices.',
            'status' => 'approved',
            'commission_rate' => 8.00,
            'total_revenue' => 12840000,
            'total_orders' => 1024,
            'total_products' => 87,
            'rating' => 4.90,
            'fraud_score' => 95,
            'verification_status' => 'verified',
        ]);

        $glowVendor = Vendor::create([
            'id' => Str::uuid(),
            'user_id' => $glowUser->id,
            'shop_name' => 'GlowUp Beauty',
            'shop_description' => 'Premium skincare, makeup, and beauty products. Curated collections for the modern Nigerian woman.',
            'status' => 'pending',
            'commission_rate' => 10.00,
            'total_revenue' => 0,
            'total_orders' => 0,
            'total_products' => 12,
            'rating' => 0,
            'fraud_score' => 0,
            'verification_status' => 'pending',
        ]);

        $homeVendor = Vendor::create([
            'id' => Str::uuid(),
            'user_id' => $homeUser->id,
            'shop_name' => 'HomeGoods NG',
            'shop_description' => 'Everything for your home. Furniture, kitchenware, bedding, decor, and more.',
            'status' => 'approved',
            'commission_rate' => 10.00,
            'total_revenue' => 2180000,
            'total_orders' => 284,
            'total_products' => 45,
            'rating' => 4.70,
            'fraud_score' => 88,
            'verification_status' => 'verified',
        ]);

        $fitVendor = Vendor::create([
            'id' => Str::uuid(),
            'user_id' => $fitUser->id,
            'shop_name' => 'FitLife Store',
            'shop_description' => 'Your fitness journey starts here. Premium supplements, gym equipment, yoga gear, and activewear.',
            'status' => 'pending',
            'commission_rate' => 10.00,
            'total_revenue' => 0,
            'total_orders' => 0,
            'total_products' => 8,
            'rating' => 0,
            'fraud_score' => 0,
            'verification_status' => 'pending',
        ]);

        $luxuryVendor = Vendor::create([
            'id' => Str::uuid(),
            'user_id' => $luxuryUser->id,
            'shop_name' => 'Luxury Time NG',
            'shop_description' => 'Premium watches and jewelry. Authentic luxury timepieces and fine jewelry at competitive prices.',
            'status' => 'approved',
            'commission_rate' => 10.00,
            'total_revenue' => 3500000,
            'total_orders' => 520,
            'total_products' => 18,
            'rating' => 4.80,
            'fraud_score' => 90,
            'verification_status' => 'verified',
        ]);

        $naijaVendor = Vendor::create([
            'id' => Str::uuid(),
            'user_id' => $naijaUser->id,
            'shop_name' => 'Naija Bites',
            'shop_description' => 'Delicious Nigerian and continental cuisine. From burgers to jollof, we deliver the taste of Nigeria.',
            'status' => 'approved',
            'commission_rate' => 12.00,
            'total_revenue' => 1800000,
            'total_orders' => 3400,
            'total_products' => 15,
            'rating' => 4.50,
            'fraud_score' => 85,
            'verification_status' => 'verified',
        ]);

        $kidsVendor = Vendor::create([
            'id' => Str::uuid(),
            'user_id' => $kidsUser->id,
            'shop_name' => 'Kids Paradise',
            'shop_description' => 'Toys, games, and educational materials for children of all ages. Making learning fun!',
            'status' => 'approved',
            'commission_rate' => 10.00,
            'total_revenue' => 950000,
            'total_orders' => 1200,
            'total_products' => 28,
            'rating' => 4.40,
            'fraud_score' => 82,
            'verification_status' => 'verified',
        ]);

        $adaezeUser->vendor_id = $adaezeVendor->id;
        $adaezeUser->save();

        $kicksUser->vendor_id = $kicksVendor->id;
        $kicksUser->save();

        $techUser->vendor_id = $techVendor->id;
        $techUser->save();

        $glowUser->vendor_id = $glowVendor->id;
        $glowUser->save();

        $homeUser->vendor_id = $homeVendor->id;
        $homeUser->save();

        $fitUser->vendor_id = $fitVendor->id;
        $fitUser->save();

        $luxuryUser->vendor_id = $luxuryVendor->id;
        $luxuryUser->save();

        $naijaUser->vendor_id = $naijaVendor->id;
        $naijaUser->save();

        $kidsUser->vendor_id = $kidsVendor->id;
        $kidsUser->save();
    }
}
