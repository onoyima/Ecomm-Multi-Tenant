<?php
namespace Database\Factories;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\Factory;
class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;
    public function definition(): array
    {
        return [
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'order_id' => Order::factory(),
            'product_id' => Product::factory(),
            'vendor_id' => Vendor::factory(),
            'title' => fake()->words(3, true),
            'price' => fake()->randomFloat(2, 5, 200),
            'qty' => fake()->numberBetween(1, 5),
        ];
    }
}
