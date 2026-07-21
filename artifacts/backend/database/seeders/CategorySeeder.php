<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Fashion', 'icon' => 'shirt', 'color' => '#FF6B9D', 'display_order' => 1],
            ['name' => 'Electronics', 'icon' => 'phone', 'color' => '#5B4EFF', 'display_order' => 2],
            ['name' => 'Shoes', 'icon' => 'footprints', 'color' => '#FF6B35', 'display_order' => 3],
            ['name' => 'Home', 'icon' => 'home', 'color' => '#10B981', 'display_order' => 4],
            ['name' => 'Beauty', 'icon' => 'sparkles', 'color' => '#F59E0B', 'display_order' => 5],
            ['name' => 'Sports', 'icon' => 'dumbbell', 'color' => '#EF4444', 'display_order' => 6],
            ['name' => 'Books', 'icon' => 'book', 'color' => '#6366F1', 'display_order' => 7],
            ['name' => 'Food', 'icon' => 'utensil', 'color' => '#FF8C42', 'display_order' => 8],
        ];

        foreach ($categories as $cat) {
            Category::create([
                'id' => Str::uuid(),
                'name' => $cat['name'],
                'icon' => $cat['icon'],
                'color' => $cat['color'],
                'display_order' => $cat['display_order'],
                'is_active' => true,
            ]);
        }
    }
}
