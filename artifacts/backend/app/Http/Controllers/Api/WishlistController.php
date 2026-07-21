<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\WishlistResource;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $req): JsonResponse
    {
        $items = Wishlist::with('product.images', 'product.vendor')
            ->where('user_id', $req->user()->id)->get();
        return response()->json(['success' => true, 'message' => 'Wishlist retrieved', 'data' => WishlistResource::collection($items)]);
    }

    public function toggle(Request $req): JsonResponse
    {
        $validated = $req->validate(['product_id' => 'required|exists:products,id']);
        $existing = Wishlist::where('user_id', $req->user()->id)
            ->where('product_id', $validated['product_id'])->first();
        if ($existing) {
            $existing->delete();
            return response()->json(['success' => true, 'message' => 'Removed from wishlist', 'data' => null]);
        }
        $item = Wishlist::create(['user_id' => $req->user()->id, 'product_id' => $validated['product_id']]);
        return response()->json(['success' => true, 'message' => 'Added to wishlist', 'data' => new WishlistResource($item->load('product'))], 201);
    }

    public function add(Request $req): JsonResponse
    {
        $validated = $req->validate(['product_id' => 'required|exists:products,id']);
        $existing = Wishlist::where('user_id', $req->user()->id)
            ->where('product_id', $validated['product_id'])->first();
        if ($existing) {
            return response()->json(['success' => false, 'message' => 'Already in wishlist', 'data' => null], 422);
        }
        $item = Wishlist::create(['user_id' => $req->user()->id, 'product_id' => $validated['product_id']]);
        return response()->json(['success' => true, 'message' => 'Added to wishlist', 'data' => new WishlistResource($item->load('product'))], 201);
    }

    public function remove(string $id): JsonResponse
    {
        $item = Wishlist::where('id', $id)->where('user_id', auth()->id())->first();
        if (!$item) {
            return response()->json(['success' => false, 'message' => 'Item not found', 'data' => null], 404);
        }
        $item->delete();
        return response()->json(['success' => true, 'message' => 'Removed from wishlist', 'data' => null]);
    }
}
