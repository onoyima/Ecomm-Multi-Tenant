<?php
namespace Tests\Feature;
use App\Models\User;
use App\Models\Vendor;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
class LowStockAlertTest extends TestCase
{
    use RefreshDatabase;
    public function test_unauthenticated_cannot_access(): void
    {
        $response = $this->getJson('/api/v1/low-stock-alerts');
        $response->assertStatus(401);
    }
    public function test_authenticated_user_can_list_alerts(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        $response = $this->withToken($token)->getJson('/api/v1/low-stock-alerts');
        $response->assertOk();
    }
    public function test_vendor_can_create_and_resolve_alert(): void
    {
        $vendor = Vendor::factory()->create();
        $user = User::factory()->create(['role' => 'vendor', 'vendor_id' => $vendor->id]);
        $token = $user->createToken('test')->plainTextToken;
        $product = Product::factory()->create(['vendor_id' => $vendor->id, 'stock' => 5]);
        $create = $this->withToken($token)->postJson('/api/v1/low-stock-alerts', [
            'product_id' => $product->id,
            'threshold' => 10,
        ]);
        $create->assertCreated()
            ->assertJsonPath('success', true);
        $alertId = $create->json('data.id');
        $resolve = $this->withToken($token)->postJson("/api/v1/low-stock-alerts/{$alertId}/resolve");
        $resolve->assertOk();
    }
}
