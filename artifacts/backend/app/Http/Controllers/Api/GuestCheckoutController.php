<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\InitiateGuestCheckoutRequest;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GuestCheckoutController extends Controller
{
    public function initiate(InitiateGuestCheckoutRequest $req): JsonResponse
    {
        try {
            DB::beginTransaction();

            $subtotal = 0;
            $productIds = collect($req->items)->pluck('product_id');
            $products = Product::whereIn('id', $productIds)->get()->keyBy('id');

            $items = [];
            foreach ($req->items as $item) {
                $product = $products->get($item['product_id']);
                if (!$product) {
                    DB::rollBack();
                    return response()->json(['success' => false, 'message' => "Product {$item['product_id']} not found", 'data' => null], 404);
                }
                $qty = (int) $item['quantity'];
                $items[] = [
                    'product' => $product,
                    'qty' => $qty,
                ];
                $subtotal += $product->price * $qty;
            }

            $token = Str::random(64);

            $order = Order::create([
                'customer_id' => null,
                'subtotal' => $subtotal,
                'shipping_fee' => $req->shipping_fee ?? 0,
                'total' => $subtotal + ($req->shipping_fee ?? 0),
                'status' => 'pending',
                'shipping_address' => $req->shipping_address,
                'payment_method' => $req->payment_method,
                'notes' => json_encode([
                    'guest_token' => $token,
                    'guest_name' => $req->guest_name,
                    'guest_email' => $req->guest_email,
                    'guest_phone' => $req->guest_phone,
                ]),
            ]);

            foreach ($items as $entry) {
                $product = $entry['product'];
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'vendor_id' => $product->vendor_id,
                    'title' => $product->title,
                    'image' => is_array($product->images) && count($product->images) > 0
                        ? (is_string($product->images[0]) ? $product->images[0] : ($product->images[0]['url'] ?? null))
                        : null,
                    'price' => $product->price,
                    'qty' => $entry['qty'],
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Guest checkout initiated',
                'data' => [
                    'order' => $order->load('items.product'),
                    'guest_token' => $token,
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage(), 'data' => null], 500);
        }
    }

    public function complete(Request $req, string $id): JsonResponse
    {
        $order = Order::find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found', 'data' => null], 404);
        }

        if ($order->customer_id !== null) {
            return response()->json(['success' => false, 'message' => 'Not a guest order', 'data' => null], 422);
        }

        $notes = json_decode($order->notes, true);
        $token = $req->input('guest_token');
        if (!$notes || !isset($notes['guest_token']) || !$token || $notes['guest_token'] !== $token) {
            return response()->json(['success' => false, 'message' => 'Invalid guest token', 'data' => null], 403);
        }

        if (!in_array($order->status, ['pending'])) {
            return response()->json(['success' => false, 'message' => 'Order cannot be completed', 'data' => null], 422);
        }

        $order->update(['status' => 'completed', 'payment_status' => 'paid']);

        return response()->json(['success' => true, 'message' => 'Guest order completed', 'data' => $order->fresh()->load('items.product')]);
    }
}
