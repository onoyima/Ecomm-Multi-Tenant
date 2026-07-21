<?php
namespace Tests\Feature;
use App\Models\User;
use App\Models\Product;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
class OrderTemplateTest extends TestCase
{
    use RefreshDatabase;
    public function test_unauthenticated_cannot_access_templates(): void
    {
        $response = $this->getJson('/api/v1/order-templates');
        $response->assertStatus(401);
    }
    public function test_authenticated_user_can_manage_templates(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        $vendor = Vendor::factory()->create();
        $product = Product::factory()->create(['vendor_id' => $vendor->id]);
        $store = $this->withToken($token)->postJson('/api/v1/order-templates', [
            'name' => 'Weekly Groceries',
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
        ]);
        $store->assertCreated()
            ->assertJsonPath('data.name', 'Weekly Groceries');
        $templateId = $store->json('data.id');
        $index = $this->withToken($token)->getJson('/api/v1/order-templates');
        $index->assertOk()->assertJsonCount(1, 'data');
        $destroy = $this->withToken($token)->deleteJson("/api/v1/order-templates/{$templateId}");
        $destroy->assertOk();
        $index2 = $this->withToken($token)->getJson('/api/v1/order-templates');
        $index2->assertOk()->assertJsonCount(0, 'data');
    }
}
