<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderItemResource;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderItemController extends Controller
{
    public function index(string $orderId): JsonResponse
    {
        $order = Order::find($orderId);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found', 'data' => null], 404);
        }
        $user = auth()->user();
        if ($user->role === 'customer' && $order->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized', 'data' => null], 403);
        }
        $items = OrderItem::with('product.images')->where('order_id', $orderId)->get();
        return response()->json(['success' => true, 'message' => 'Order items retrieved', 'data' => OrderItemResource::collection($items)]);
    }

    public function show(string $orderId, string $id): JsonResponse
    {
        $item = OrderItem::with('product.images', 'order')->where('order_id', $orderId)->where('id', $id)->first();
        if (!$item) {
            return response()->json(['success' => false, 'message' => 'Item not found', 'data' => null], 404);
        }
        return response()->json(['success' => true, 'message' => 'Order item retrieved', 'data' => new OrderItemResource($item)]);
    }
}
