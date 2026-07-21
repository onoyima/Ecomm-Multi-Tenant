<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DropshipRequestResource;
use App\Models\DropshipRequest;
use App\Services\DropshippingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DropshipRequestController extends Controller
{
    use FlattensPagination;

    public function index(Request $req): JsonResponse
    {
        $vendor = $req->user()->vendor;
        if (!$vendor) {
            return response()->json(['success' => false, 'message' => 'No vendor profile', 'data' => null], 404);
        }
        $requests = DropshipRequest::where('vendor_id', $vendor->id)
            ->orderBy('created_at', 'desc')
            ->paginate($req->per_page ?? 15);
        return $this->paginatedResponse($requests, 'Dropship requests', DropshipRequestResource::class);
    }

    public function store(Request $req): JsonResponse
    {
        $vendor = $req->user()->vendor;
        if (!$vendor) {
            return response()->json(['success' => false, 'message' => 'No vendor profile', 'data' => null], 404);
        }
        $validated = $req->validate([
            'source_url' => 'required|url|max:2048',
            'markup_percent' => 'nullable|numeric|min:0|max:100',
        ]);
        try {
            DB::beginTransaction();
            $dropshipRequest = DropshipRequest::create([
                'vendor_id' => $vendor->id,
                'source_url' => $validated['source_url'],
                'markup_percent' => $validated['markup_percent'] ?? 20,
                'status' => 'pending',
            ]);
            $dropshippingService = new DropshippingService();
            $dropshippingService->importProduct($dropshipRequest);
            DB::commit();
            return response()->json(['success' => true, 'message' => 'Dropship request created', 'data' => new DropshipRequestResource($dropshipRequest)], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage(), 'data' => null], 500);
        }
    }

    public function show(string $id): JsonResponse
    {
        $dropshipRequest = DropshipRequest::with('vendor', 'product')->find($id);
        if (!$dropshipRequest) {
            return response()->json(['success' => false, 'message' => 'Request not found', 'data' => null], 404);
        }
        return response()->json(['success' => true, 'message' => 'Dropship request', 'data' => new DropshipRequestResource($dropshipRequest)]);
    }

    public function update(string $id, Request $req): JsonResponse
    {
        $vendor = auth()->user()->vendor;
        if (!$vendor) {
            return response()->json(['success' => false, 'message' => 'No vendor profile', 'data' => null], 404);
        }
        $dropshipRequest = DropshipRequest::where('id', $id)->where('vendor_id', $vendor->id)->first();
        if (!$dropshipRequest) {
            return response()->json(['success' => false, 'message' => 'Request not found', 'data' => null], 404);
        }
        $validated = $req->validate([
            'markup_percent' => 'nullable|numeric|min:0|max:100',
            'status' => 'nullable|string|in:pending,processing,completed,failed',
        ]);
        $dropshipRequest->update($validated);
        return response()->json(['success' => true, 'message' => 'Request updated', 'data' => new DropshipRequestResource($dropshipRequest->fresh())]);
    }

    public function destroy(string $id): JsonResponse
    {
        $vendor = auth()->user()->vendor;
        if (!$vendor) {
            return response()->json(['success' => false, 'message' => 'No vendor profile', 'data' => null], 404);
        }
        $dropshipRequest = DropshipRequest::where('id', $id)->where('vendor_id', $vendor->id)->first();
        if (!$dropshipRequest) {
            return response()->json(['success' => false, 'message' => 'Request not found', 'data' => null], 404);
        }
        $dropshipRequest->delete();
        return response()->json(['success' => true, 'message' => 'Request deleted', 'data' => null]);
    }
}
