<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendorOrderController extends Controller
{
    use FlattensPagination;

    public function index(Request $req): JsonResponse
    {
        $vendor = $req->user()->vendor;
        if (!$vendor) {
            return response()->json(['success' => false, 'message' => 'No vendor profile', 'data' => null], 404);
        }
        $query = Order::whereHas('items', fn($q) => $q->where('vendor_id', $vendor->id))
            ->with(['items' => fn($q) => $q->where('vendor_id', $vendor->id)->with('product'), 'user']);
        if ($req->status) $query->where('status', $req->status);
        $orders = $query->orderBy('created_at', 'desc')->paginate($req->per_page ?? 15);
        return $this->paginatedResponse($orders, 'Orders retrieved', OrderResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $vendor = auth()->user()->vendor;
        if (!$vendor) {
            return response()->json(['success' => false, 'message' => 'No vendor profile', 'data' => null], 404);
        }
        $order = Order::with(['items' => fn($q) => $q->where('vendor_id', $vendor->id)->with('product'), 'trackingEvents', 'user'])
            ->whereHas('items', fn($q) => $q->where('vendor_id', $vendor->id))
            ->find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found', 'data' => null], 404);
        }
        return response()->json(['success' => true, 'message' => 'Order retrieved', 'data' => new OrderResource($order)]);
    }

    public function updateStatus(string $id, Request $req): JsonResponse
    {
        $vendor = auth()->user()->vendor;
        if (!$vendor) {
            return response()->json(['success' => false, 'message' => 'No vendor profile', 'data' => null], 404);
        }
        $order = Order::whereHas('items', fn($q) => $q->where('vendor_id', $vendor->id))->find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found', 'data' => null], 404);
        }
        $validated = $req->validate([
            'status' => 'required|string|in:pending,processing,shipped,delivered,cancelled',
            'tracking_number' => 'nullable|string',
            'carrier' => 'nullable|string',
        ]);
        $order->update($validated);
        return response()->json(['success' => true, 'message' => 'Status updated', 'data' => new OrderResource($order->fresh()->load('items.product', 'trackingEvents'))]);
    }
}
