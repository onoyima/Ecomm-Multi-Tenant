<?php
namespace Tests\Feature;
use App\Models\ABTest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
class ABTestingTest extends TestCase
{
    use RefreshDatabase;
    public function test_admin_can_manage_ab_tests(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test')->plainTextToken;
        $create = $this->withToken($token)->postJson('/api/v1/admin/ab-tests', [
            'name' => 'Homepage Banner A vs B',
            'description' => 'Testing new banner design',
        ]);
        $create->assertCreated()
            ->assertJsonPath('data.name', 'Homepage Banner A vs B');
        $index = $this->withToken($token)->getJson('/api/v1/admin/ab-tests');
        $index->assertOk()->assertJsonCount(1, 'data');
        $testId = $create->json('data.id');
        $results = $this->withToken($token)->getJson("/api/v1/admin/ab-tests/{$testId}/results");
        $results->assertOk();
    }
    public function test_non_admin_cannot_create_ab_tests(): void
    {
        $user = User::factory()->create(['role' => 'customer']);
        $token = $user->createToken('test')->plainTextToken;
        $response = $this->withToken($token)->postJson('/api/v1/admin/ab-tests', ['name' => 'Test']);
        $response->assertStatus(403);
    }
}
