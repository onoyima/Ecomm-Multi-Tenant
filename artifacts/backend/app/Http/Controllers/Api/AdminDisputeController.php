<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DisputeResource;
use App\Models\Dispute;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDisputeController extends Controller
{
    use FlattensPagination;

    public function index(Request $req): JsonResponse
    {
        if ($req->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized', 'data' => null], 403);
        }
        $query = Dispute::with('order', 'user');
        if ($req->status) $query->where('status', $req->status);
        $disputes = $query->orderBy('created_at', 'desc')->paginate($req->per_page ?? 15);
        return $this->paginatedResponse($disputes, 'Disputes retrieved', DisputeResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $dispute = Dispute::with('order.items.product', 'order.user', 'user')->find($id);
        if (!$dispute) {
            return response()->json(['success' => false, 'message' => 'Dispute not found', 'data' => null], 404);
        }
        return response()->json(['success' => true, 'message' => 'Dispute details', 'data' => new DisputeResource($dispute)]);
    }

    public function resolve(string $id, Request $req): JsonResponse
    {
        $dispute = Dispute::find($id);
        if (!$dispute) {
            return response()->json(['success' => false, 'message' => 'Dispute not found', 'data' => null], 404);
        }
        $validated = $req->validate(['resolution' => 'required|string']);
        $dispute->update([
            'status' => 'resolved',
            'resolution' => $validated['resolution'],
            'resolved_by' => $req->user()->id,
        ]);
        return response()->json(['success' => true, 'message' => 'Dispute resolved', 'data' => new DisputeResource($dispute->fresh()->load('order', 'user'))]);
    }

    public function escalate(string $id): JsonResponse
    {
        $dispute = Dispute::find($id);
        if (!$dispute) {
            return response()->json(['success' => false, 'message' => 'Dispute not found', 'data' => null], 404);
        }
        $dispute->update(['status' => 'investigating']);
        return response()->json(['success' => true, 'message' => 'Dispute escalated', 'data' => new DisputeResource($dispute->fresh()->load('order', 'user'))]);
    }
}
