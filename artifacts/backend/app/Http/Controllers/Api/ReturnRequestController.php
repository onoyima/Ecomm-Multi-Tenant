<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReturnRequestResource;
use App\Models\ReturnRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReturnRequestController extends Controller
{
    use FlattensPagination;

    public function index(Request $req): JsonResponse
    {
        $user = $req->user();
        $query = ReturnRequest::with('order', 'customer', 'vendor', 'product');
        if ($user->role === 'vendor') {
            $query->where('vendor_id', $user->id);
        } elseif ($user->role === 'customer') {
            $query->where('customer_id', $user->id);
        }
        $items = $query->orderBy('created_at', 'desc')->paginate($req->per_page ?? 15);
        return $this->paginatedResponse($items, 'Return requests retrieved', ReturnRequestResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $returnRequest = ReturnRequest::with('order', 'customer', 'vendor', 'product')->find($id);
        if (!$returnRequest) {
            return response()->json(['success' => false, 'message' => 'Return request not found', 'data' => null], 404);
        }
        return response()->json(['success' => true, 'message' => 'Return request retrieved', 'data' => new ReturnRequestResource($returnRequest)]);
    }

    public function store(Request $req): JsonResponse
    {
        if ($req->user()->role !== 'customer') {
            return response()->json(['success' => false, 'message' => 'Only customers can create return requests', 'data' => null], 403);
        }
        $validated = $req->validate([
            'order_id' => 'required|exists:orders,id',
            'product_id' => 'required|exists:products,id',
            'reason' => 'required|string|max:1000',
            'quantity' => 'nullable|integer|min:1',
            'refund_amount' => 'nullable|numeric|min:0',
        ]);
        $validated['customer_id'] = $req->user()->id;
        $validated['status'] = 'pending';
        $returnRequest = ReturnRequest::create($validated);
        return response()->json(['success' => true, 'message' => 'Return request created', 'data' => new ReturnRequestResource($returnRequest)], 201);
    }

    public function approve(string $id): JsonResponse
    {
        $returnRequest = ReturnRequest::find($id);
        if (!$returnRequest) {
            return response()->json(['success' => false, 'message' => 'Return request not found', 'data' => null], 404);
        }
        $returnRequest->update(['status' => 'approved']);
        return response()->json(['success' => true, 'message' => 'Return request approved', 'data' => new ReturnRequestResource($returnRequest)]);
    }

    public function reject(string $id, Request $req): JsonResponse
    {
        $returnRequest = ReturnRequest::find($id);
        if (!$returnRequest) {
            return response()->json(['success' => false, 'message' => 'Return request not found', 'data' => null], 404);
        }
        $validated = $req->validate(['reason' => 'required|string|max:1000']);
        $returnRequest->update(['status' => 'rejected', 'resolution' => $validated['reason']]);
        return response()->json(['success' => true, 'message' => 'Return request rejected', 'data' => new ReturnRequestResource($returnRequest)]);
    }

    public function markRefunded(string $id): JsonResponse
    {
        $returnRequest = ReturnRequest::find($id);
        if (!$returnRequest) {
            return response()->json(['success' => false, 'message' => 'Return request not found', 'data' => null], 404);
        }
        $returnRequest->update(['status' => 'refunded']);
        return response()->json(['success' => true, 'message' => 'Return request marked as refunded', 'data' => new ReturnRequestResource($returnRequest)]);
    }
}
