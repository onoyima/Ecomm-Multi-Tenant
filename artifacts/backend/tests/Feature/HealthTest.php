<?php
namespace Tests\Feature;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
class HealthTest extends TestCase
{
    use RefreshDatabase;
    public function test_health_endpoint_returns_system_stats(): void
    {
        $response = $this->getJson('/api/v1/health');
        $response->assertOk()
            ->assertJsonStructure([
                'success', 'data' => [
                    'totalUsers', 'totalOrders', 'totalProducts',
                    'pendingDisputes', 'ordersToday', 'revenueToday',
                    'serverTime', 'phpVersion',
                ],
            ]);
    }
}
