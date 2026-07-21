<?php
namespace Database\Factories;
use App\Models\Wallet;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
class WalletFactory extends Factory
{
    protected $model = Wallet::class;
    public function definition(): array
    {
        return [
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => User::factory(),
            'balance' => 0,
            'currency' => 'NGN',
        ];
    }
}
