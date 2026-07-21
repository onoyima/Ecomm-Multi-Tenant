<?php
namespace Database\Factories;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\Factory;
class VendorFactory extends Factory
{
    protected $model = Vendor::class;
    public function definition(): array
    {
        return [
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => User::factory(),
            'shop_name' => fake()->company(),
            'shop_description' => fake()->sentence(),
            'status' => 'active',
            'commission_rate' => 10.00,
        ];
    }
}
