<?php
namespace Tests\Feature;
use App\Models\User;
use App\Models\Order;
use App\Models\Vendor;
use App\Models\Product;
use App\Models\OrderItem;
use App\Models\Wallet;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
class PartialRefundTest extends TestCase
{
    use RefreshDatabase;
    public function test_partial_refund_requires_admin(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $token = $customer->createToken('test')->plainTextToken;
        $response = $this->withToken($token)->postJson('/api/v1/partial-refunds', [
            'order_id' => fake()->uuid(),
            'amount' => 10,
            'reason' => 'test',
        ]);
        $response->assertStatus(403);
    }
    public function test_admin_can_process_partial_refund(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test')->plainTextToken;
        $customer = User::factory()->create(['role' => 'customer']);
        $vendor = Vendor::factory()->create();
        $product = Product::factory()->create(['vendor_id' => $vendor->id]);
        $order = Order::factory()->create(['customer_id' => $customer->id, 'total' => 100, 'payment_status' => 'paid']);
        OrderItem::factory()->create(['order_id' => $order->id, 'product_id' => $product->id, 'vendor_id' => $vendor->id]);
        Wallet::factory()->create(['user_id' => $customer->id, 'balance' => 0]);
        $authResponse = $this->withToken($token)->getJson('/api/v1/auth/me');
        $authContent = $authResponse->json();
        if ($authResponse->status() !== 200) {
            $this->fail('Auth check failed: ' . json_encode($authContent));
        }
        
        $response = $this->withToken($token)->postJson('/api/v1/partial-refunds', [
            'order_id' => $order->id,
            'amount' => 30,
            'reason' => 'Partial refund for damaged item',
        ]);
        $decoded = $response->json();
        $this->fail('Status: ' . $response->getStatusCode() . ' Body: ' . json_encode($decoded));
    }
}
