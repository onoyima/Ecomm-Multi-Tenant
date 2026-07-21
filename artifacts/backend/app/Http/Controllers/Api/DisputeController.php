<?php

namespace App\Http\Controllers\Api;

use App\Events\DisputeRaised;
use App\Http\Controllers\Controller;
use App\Http\Resources\DisputeResource;
use App\Models\Dispute;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DisputeController extends Controller
{
    use FlattensPagination;

    public function index(Request $req): JsonResponse
    {
        $user = $req->user();
        $query = Dispute::with('order', 'user');
        if ($user->role === 'customer') {
            $query->where('user_id', $user->id);
        } elseif ($user->role === 'vendor') {
            $query->whereHas('order.items', fn($q) => $q->where('vendor_id', $user->vendor?->id));
        }
        $disputes = $query->orderBy('created_at', 'desc')->paginate($req->per_page ?? 15);
        return $this->paginatedResponse($disputes, 'Disputes retrieved', DisputeResource::class);
    }

    public function store(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'order_id' => 'required|exists:orders,id',
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
        ]);
        $dispute = Dispute::create([
            'user_id' => $req->user()->id,
            'order_id' => $validated['order_id'],
            'subject' => $validated['subject'],
            'description' => $validated['description'],
            'status' => 'open',
        ]);
        event(new DisputeRaised($dispute));
        return response()->json(['success' => true, 'message' => 'Dispute created', 'data' => new DisputeResource($dispute->load('order', 'user'))], 201);
    }

    public function show(string $id): JsonResponse
    {
        $dispute = Dispute::with('order.items.product', 'user')->find($id);
        if (!$dispute) {
            return response()->json(['success' => false, 'message' => 'Dispute not found', 'data' => null], 404);
        }
        return response()->json(['success' => true, 'message' => 'Dispute retrieved', 'data' => new DisputeResource($dispute)]);
    }

    public function resolve(string $id, Request $req): JsonResponse
    {
        if ($req->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized', 'data' => null], 403);
        }
        $dispute = Dispute::find($id);
        if (!$dispute) {
            return response()->json(['success' => false, 'message' => 'Dispute not found', 'data' => null], 404);
        }
        $validated = $req->validate(['resolution' => 'required|string']);
        $dispute->update(['status' => 'resolved', 'resolution' => $validated['resolution'], 'resolved_by' => $req->user()->id]);
        return response()->json(['success' => true, 'message' => 'Dispute resolved', 'data' => new DisputeResource($dispute->fresh())]);
    }

    public function escalate(string $id): JsonResponse
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized', 'data' => null], 403);
        }
        $dispute = Dispute::find($id);
        if (!$dispute) {
            return response()->json(['success' => false, 'message' => 'Dispute not found', 'data' => null], 404);
        }
        $dispute->update(['status' => 'investigating']);
        return response()->json(['success' => true, 'message' => 'Dispute escalated', 'data' => new DisputeResource($dispute->fresh())]);
    }
}
