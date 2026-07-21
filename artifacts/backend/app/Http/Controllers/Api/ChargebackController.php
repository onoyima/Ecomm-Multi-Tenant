<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Chargeback;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class ChargebackController extends Controller {
    use FlattensPagination;
    public function index(Request $req): JsonResponse {
        $user = $req->user();
        $query = Chargeback::with('order');
        if ($user->role === 'customer') $query->where('customer_id', $user->id);
        $chargebacks = $query->latest()->paginate($req->per_page ?? 15);
        return $this->paginatedResponse($chargebacks, 'Chargebacks retrieved');
    }
    public function store(Request $req): JsonResponse {
        $validated = $req->validate([
            'order_id' => 'required|exists:orders,id',
            'reason' => 'required|string|max:1000',
            'evidence_urls' => 'nullable|array',
            'evidence_urls.*' => 'url',
        ]);
        $chargeback = Chargeback::create([
            'customer_id' => $req->user()->id,
            'order_id' => $validated['order_id'],
            'reason' => $validated['reason'],
            'evidence_urls' => $validated['evidence_urls'] ?? [],
            'status' => 'open',
        ]);
        return response()->json(['success' => true, 'message' => 'Chargeback created', 'data' => $chargeback->load('order')], 201);
    }
    public function resolve(string $id, Request $req): JsonResponse {
        if ($req->user()->role !== 'admin') return response()->json(['success' => false, 'message' => 'Unauthorized', 'data' => null], 403);
        $chargeback = Chargeback::find($id);
        if (!$chargeback) return response()->json(['success' => false, 'message' => 'Chargeback not found', 'data' => null], 404);
        $validated = $req->validate(['resolution' => 'required|string', 'status' => 'required|in:resolved,rejected']);
        $chargeback->update(['status' => $validated['status'], 'resolution' => $validated['resolution'], 'resolved_by' => $req->user()->id]);
        return response()->json(['success' => true, 'message' => 'Chargeback updated', 'data' => $chargeback->fresh()->load('order')]);
    }
}
