<?php
namespace Tests\Feature;
use App\Models\Chargeback;
use App\Models\User;
use App\Models\Order;
use App\Models\Vendor;
use App\Models\Product;
use App\Models\OrderItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
class ChargebackTest extends TestCase
{
    use RefreshDatabase;
    public function test_customer_can_create_chargeback(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $token = $customer->createToken('test')->plainTextToken;
        $vendor = Vendor::factory()->create();
        $product = Product::factory()->create(['vendor_id' => $vendor->id]);
        $order = Order::factory()->create(['customer_id' => $customer->id, 'status' => 'delivered']);
        OrderItem::factory()->create(['order_id' => $order->id, 'product_id' => $product->id, 'vendor_id' => $vendor->id]);
        $response = $this->withToken($token)->postJson('/api/v1/chargebacks', [
            'order_id' => $order->id,
            'reason' => 'Product not as described',
        ]);
        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'open');
    }
    public function test_admin_can_resolve_chargeback(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $admin = User::factory()->create(['role' => 'admin']);
        $adminToken = $admin->createToken('test')->plainTextToken;
        $vendor = Vendor::factory()->create();
        $product = Product::factory()->create(['vendor_id' => $vendor->id]);
        $order = Order::factory()->create(['customer_id' => $customer->id]);
        OrderItem::factory()->create(['order_id' => $order->id, 'product_id' => $product->id, 'vendor_id' => $vendor->id]);
        $cb = Chargeback::create([
            'order_id' => $order->id,
            'customer_id' => $customer->id,
            'reason' => 'Defective item',
            'status' => 'open',
        ]);
        $response = $this->withToken($adminToken)->postJson("/api/v1/chargebacks/{$cb->id}/resolve", [
            'resolution' => 'Refund issued',
            'status' => 'resolved',
        ]);
        $response->assertOk()
            ->assertJsonPath('data.status', 'resolved');
    }
    public function test_admin_can_list_chargebacks(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test')->plainTextToken;
        $response = $this->withToken($token)->getJson('/api/v1/chargebacks');
        $response->assertOk();
    }
}
