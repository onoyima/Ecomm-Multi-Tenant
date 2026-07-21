<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CartResource;
use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function show(Request $req): JsonResponse
    {
        $cart = Cart::with('items.product.images', 'items.product.vendor')->where('user_id', $req->user()->id)->first();
        if (!$cart) {
            return response()->json(['success' => true, 'message' => 'Cart is empty', 'data' => null]);
        }
        return response()->json(['success' => true, 'message' => 'Cart retrieved', 'data' => new CartResource($cart)]);
    }

    public function addItem(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'variant' => 'nullable|string|max:255',
        ]);
        $cart = Cart::firstOrCreate(['user_id' => $req->user()->id]);
        $existingItem = $cart->items()->where('product_id', $validated['product_id'])
            ->where('variant', $validated['variant'])->first();
        if ($existingItem) {
            $existingItem->increment('quantity', $validated['quantity']);
        } else {
            $cart->items()->create($validated);
        }
        $cart->load('items.product.images', 'items.product.vendor');
        return response()->json(['success' => true, 'message' => 'Item added', 'data' => new CartResource($cart)], 201);
    }

    public function updateItem(Request $req, string $id): JsonResponse
    {
        $validated = $req->validate(['quantity' => 'required|integer|min:1']);
        $item = CartItem::where('id', $id)->whereHas('cart', fn($q) => $q->where('user_id', $req->user()->id))->first();
        if (!$item) {
            return response()->json(['success' => false, 'message' => 'Item not found', 'data' => null], 404);
        }
        $item->update($validated);
        $cart = $item->cart->load('items.product.images', 'items.product.vendor');
        return response()->json(['success' => true, 'message' => 'Item updated', 'data' => new CartResource($cart)]);
    }

    public function removeItem(string $id): JsonResponse
    {
        $item = CartItem::where('id', $id)->whereHas('cart', fn($q) => $q->where('user_id', auth()->id()))->first();
        if (!$item) {
            return response()->json(['success' => false, 'message' => 'Item not found', 'data' => null], 404);
        }
        $item->delete();
        return response()->json(['success' => true, 'message' => 'Item removed', 'data' => null]);
    }

    public function clear(Request $req): JsonResponse
    {
        CartItem::whereHas('cart', fn($q) => $q->where('user_id', $req->user()->id))->delete();
        return response()->json(['success' => true, 'message' => 'Cart cleared', 'data' => null]);
    }
}
