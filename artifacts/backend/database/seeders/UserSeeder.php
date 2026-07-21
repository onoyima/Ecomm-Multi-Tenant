<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'id' => Str::uuid(),
            'name' => 'Emeka Admin',
            'email' => 'admin@demo.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'wallet_balance' => 0,
            'kyc_status' => 'verified',
            'is_active' => true,
        ]);

        $vendor = User::create([
            'id' => Str::uuid(),
            'name' => 'Adaeze Fashion',
            'email' => 'vendor@demo.com',
            'password' => bcrypt('password'),
            'role' => 'vendor',
            'wallet_balance' => 84500,
            'kyc_status' => 'verified',
            'is_active' => true,
        ]);

        $customer1 = User::create([
            'id' => Str::uuid(),
            'name' => 'Chidi Okafor',
            'email' => 'customer@demo.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
            'wallet_balance' => 15000,
            'kyc_status' => 'verified',
            'is_active' => true,
        ]);

        $customer2 = User::create([
            'id' => Str::uuid(),
            'name' => 'Ngozi Adeyemi',
            'email' => 'ngozi@example.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
            'wallet_balance' => 8500,
            'kyc_status' => 'pending',
            'is_active' => true,
        ]);

        $customer3 = User::create([
            'id' => Str::uuid(),
            'name' => 'Tunde Bello',
            'email' => 'tunde@example.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
            'wallet_balance' => 0,
            'kyc_status' => 'rejected',
            'is_active' => true,
        ]);

        Wallet::create([
            'id' => Str::uuid(),
            'user_id' => $admin->id,
            'balance' => 0,
            'pending_balance' => 0,
            'total_earned' => 0,
            'total_withdrawn' => 0,
            'currency' => 'NGN',
        ]);

        Wallet::create([
            'id' => Str::uuid(),
            'user_id' => $vendor->id,
            'balance' => 84500,
            'pending_balance' => 32000,
            'total_earned' => 1247500,
            'total_withdrawn' => 1130000,
            'currency' => 'NGN',
        ]);

        Wallet::create([
            'id' => Str::uuid(),
            'user_id' => $customer1->id,
            'balance' => 15000,
            'pending_balance' => 0,
            'total_earned' => 0,
            'total_withdrawn' => 0,
            'currency' => 'NGN',
        ]);

        Wallet::create([
            'id' => Str::uuid(),
            'user_id' => $customer2->id,
            'balance' => 8500,
            'pending_balance' => 0,
            'total_earned' => 0,
            'total_withdrawn' => 0,
            'currency' => 'NGN',
        ]);

        Wallet::create([
            'id' => Str::uuid(),
            'user_id' => $customer3->id,
            'balance' => 0,
            'pending_balance' => 0,
            'total_earned' => 0,
            'total_withdrawn' => 0,
            'currency' => 'NGN',
        ]);
    }
}
