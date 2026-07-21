<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\ABTest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class ABTestingController extends Controller {
    use FlattensPagination;
    public function index(Request $req): JsonResponse {
        $tests = ABTest::latest()->paginate($req->per_page ?? 15);
        return $this->paginatedResponse($tests, 'A/B tests retrieved');
    }
    public function store(Request $req): JsonResponse {
        $validated = $req->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'started_at' => 'nullable|date',
            'ended_at' => 'nullable|date|after:started_at',
        ]);
        $test = ABTest::create($validated);
        return response()->json(['success' => true, 'message' => 'A/B test created', 'data' => $test], 201);
    }
    public function results(string $id): JsonResponse {
        $test = ABTest::find($id);
        if (!$test) return response()->json(['success' => false, 'message' => 'A/B test not found', 'data' => null], 404);
        return response()->json(['success' => true, 'message' => 'A/B test results', 'data' => $test]);
    }
}
