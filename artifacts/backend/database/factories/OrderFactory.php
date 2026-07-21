<?php
namespace Database\Factories;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
class OrderFactory extends Factory
{
    protected $model = Order::class;
    public function definition(): array
    {
        return [
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'customer_id' => User::factory(),
            'status' => 'pending',
            'payment_status' => 'pending',
            'subtotal' => fake()->randomFloat(2, 20, 500),
            'shipping_fee' => 10.00,
            'shipping_address' => '123 Test Street',
            'total' => fn(array $a) => $a['subtotal'] + 10,
        ];
    }
}
