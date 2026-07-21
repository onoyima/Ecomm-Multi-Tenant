<?php

namespace App\Http\Controllers\Api;

use App\Events\OrderPlaced;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    use FlattensPagination;

    public function index(Request $req): JsonResponse
    {
        $user = $req->user();
        $query = Order::with('items.product.vendor');
        if ($user->role === 'customer') {
            $query->where('customer_id', $user->id);
        } elseif ($user->role === 'vendor') {
            $query->whereHas('items.product', fn($q) => $q->where('vendor_id', $user->vendor?->id));
        }
        if ($req->status) $query->where('status', $req->status);
        $orders = $query->orderBy('created_at', 'desc')->paginate($req->per_page ?? 15);
        return $this->paginatedResponse($orders, 'Orders retrieved', OrderResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $order = Order::with('items.product.vendor', 'items.product.images', 'trackingEvents')->find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found', 'data' => null], 404);
        }
        $user = auth()->user();
        if ($user->role === 'customer' && $order->customer_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized', 'data' => null], 403);
        }
        return response()->json(['success' => true, 'message' => 'Order retrieved', 'data' => new OrderResource($order)]);
    }

    public function store(StoreOrderRequest $req): JsonResponse
    {
        try {
            DB::beginTransaction();
            $cart = Cart::with('items.product')->where('user_id', $req->user()->id)->first();
            if (!$cart || $cart->items->isEmpty()) {
                return response()->json(['success' => false, 'message' => 'Cart is empty', 'data' => null], 422);
            }
            $order = Order::create([
                'customer_id' => $req->user()->id,
                'subtotal' => $cart->items->sum(fn($i) => $i->product->price * $i->quantity),
                'shipping_fee' => $req->shipping_fee ?? 2500,
                'total' => 0,
                'status' => 'pending',
                'shipping_address' => $req->shipping_address,
                'payment_method' => $req->payment_method,
                'notes' => $req->notes,
            ]);
            foreach ($cart->items as $cartItem) {
                $product = $cartItem->product;
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'vendor_id' => $product->vendor_id,
                    'title' => $product->title,
                    'image' => is_array($product->images) && count($product->images) > 0
                        ? (is_string($product->images[0]) ? $product->images[0] : ($product->images[0]['url'] ?? null))
                        : null,
                    'price' => $product->price,
                    'qty' => $cartItem->quantity,
                ]);
            }
            $order->update(['total' => $order->subtotal + $order->shipping_fee]);
            $cart->items()->delete();
            DB::commit();
            event(new OrderPlaced($order));
            return response()->json(['success' => true, 'message' => 'Order created', 'data' => new OrderResource($order->load('items.product'))], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage(), 'data' => null], 500);
        }
    }

    public function updateStatus(string $id, Request $req): JsonResponse
    {
        $order = Order::find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found', 'data' => null], 404);
        }
        $user = auth()->user();
        $isVendor = $user->role === 'vendor' && $order->items()->whereHas('product', fn($q) => $q->where('vendor_id', $user->vendor?->id))->exists();
        if (!$isVendor && $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized', 'data' => null], 403);
        }
        $validated = $req->validate([
            'status' => 'required|string|in:pending,processing,shipped,delivered,cancelled',
            'tracking_number' => 'nullable|string',
            'carrier' => 'nullable|string',
        ]);
        $order->update($validated);
        return response()->json(['success' => true, 'message' => 'Status updated', 'data' => new OrderResource($order->fresh()->load('items.product'))]);
    }

    public function cancel(string $id): JsonResponse
    {
        $order = Order::where('id', $id)->where('customer_id', auth()->id())->first();
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found', 'data' => null], 404);
        }
        if (!in_array($order->status, ['pending'])) {
            return response()->json(['success' => false, 'message' => 'Order cannot be cancelled', 'data' => null], 422);
        }
        $order->update(['status' => 'cancelled']);
        return response()->json(['success' => true, 'message' => 'Order cancelled', 'data' => new OrderResource($order)]);
    }
}
