<?php
namespace Tests\Feature;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
class VendorPerformanceTest extends TestCase
{
    use RefreshDatabase;
    public function test_admin_can_list_vendor_performance(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test')->plainTextToken;
        Vendor::factory()->count(3)->create();
        $response = $this->withToken($token)->getJson('/api/v1/admin/vendor-performance');
        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }
    public function test_vendor_performance_score_returns_correct_structure(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test')->plainTextToken;
        $vendor = Vendor::factory()->create();
        $response = $this->withToken($token)->getJson("/api/v1/admin/vendor-performance/{$vendor->id}");
        $response->assertOk()
            ->assertJsonStructure(['data' => ['vendorId', 'score', 'avgRating', 'fulfillmentRate', 'totalOrders', 'completedOrders']]);
    }
}
