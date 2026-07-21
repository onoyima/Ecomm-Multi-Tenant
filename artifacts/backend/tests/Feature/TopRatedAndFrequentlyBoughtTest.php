<?php
namespace Tests\Feature;
use App\Models\Product;
use App\Models\Vendor;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
class TopRatedAndFrequentlyBoughtTest extends TestCase
{
    use RefreshDatabase;
    public function test_top_rated_returns_products(): void
    {
        $vendor = Vendor::factory()->create();
        Product::factory()->count(3)->create(['vendor_id' => $vendor->id, 'is_active' => true]);
        $response = $this->getJson('/api/v1/products/top-rated');
        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data']);
    }
    public function test_frequently_bought_returns_empty_for_missing_product(): void
    {
        $response = $this->getJson('/api/v1/products/frequently-bought/non-existent-id');
        $response->assertOk();
    }
}
