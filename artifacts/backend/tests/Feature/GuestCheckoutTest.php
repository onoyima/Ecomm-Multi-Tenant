<?php
namespace Tests\Feature;
use App\Models\Product;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
class GuestCheckoutTest extends TestCase
{
    use RefreshDatabase;
    public function test_guest_checkout_initiate_requires_valid_items(): void
    {
        $response = $this->postJson('/api/v1/guest-checkout', []);
        $response->assertStatus(422);
    }
    public function test_guest_checkout_initiate_success(): void
    {
        $vendor = Vendor::factory()->create();
        $product = Product::factory()->create(['vendor_id' => $vendor->id, 'price' => 25.00, 'images' => []]);
        $response = $this->postJson('/api/v1/guest-checkout', [
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
            'guest_name' => 'John Doe',
            'guest_email' => 'john@example.com',
            'guest_phone' => '1234567890',
            'shipping_address' => '123 Main St',
            'payment_method' => 'paystack',
        ]);
        $content = $response->getContent();
        $decoded = json_decode($content, true);
        $this->fail('Error: ' . ($decoded['message'] ?? $content));
    }
    public function test_guest_checkout_complete_with_valid_token(): void
    {
        $vendor = Vendor::factory()->create();
        $product = Product::factory()->create(['vendor_id' => $vendor->id, 'price' => 10.00, 'images' => []]);
        $init = $this->postJson('/api/v1/guest-checkout', [
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
            'guest_name' => 'Jane',
            'guest_email' => 'jane@example.com',
            'shipping_address' => '456 Oak Ave',
            'payment_method' => 'paystack',
        ]);
        $orderId = $init->json('data.order.id');
        $token = $init->json('data.guestToken');
        $response = $this->postJson("/api/v1/guest-checkout/{$orderId}/complete", ['guest_token' => $token]);
        $response->assertOk()
            ->assertJsonPath('data.status', 'completed');
    }
    public function test_guest_checkout_complete_rejects_invalid_token(): void
    {
        $vendor = Vendor::factory()->create();
        $product = Product::factory()->create(['vendor_id' => $vendor->id, 'price' => 10.00, 'images' => []]);
        $init = $this->postJson('/api/v1/guest-checkout', [
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
            'guest_name' => 'Jane',
            'guest_email' => 'jane@example.com',
            'shipping_address' => '456 Oak Ave',
            'payment_method' => 'paystack',
        ]);
        $orderId = $init->json('data.order.id');
        $response = $this->postJson("/api/v1/guest-checkout/{$orderId}/complete", ['guest_token' => 'wrong-token']);
        $response->assertStatus(403);
    }
}
