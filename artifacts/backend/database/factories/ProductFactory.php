<?php
namespace Database\Factories;
use App\Models\Product;
use App\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\Factory;
class ProductFactory extends Factory
{
    protected $model = Product::class;
    public function definition(): array
    {
        return [
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'vendor_id' => Vendor::factory(),
            'title' => fake()->words(3, true),
            'description' => fake()->paragraph(),
            'price' => fake()->randomFloat(2, 5, 500),
            'category' => fake()->word(),
            'stock' => fake()->numberBetween(1, 100),
            'is_active' => true,
        ];
    }
}
