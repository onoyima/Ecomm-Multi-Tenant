<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FlashSaleResource;
use App\Models\FlashSale;
use App\Models\FlashSaleProduct;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FlashSaleController extends Controller
{
    public function index(): JsonResponse
    {
        $sales = FlashSale::with('products.product')
            ->where('status', 'active')
            ->where('start_time', '<=', now())
            ->where('end_time', '>=', now())
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json(['success' => true, 'message' => 'Flash sales retrieved', 'data' => FlashSaleResource::collection($sales)]);
    }

    public function show(string $id): JsonResponse
    {
        $sale = FlashSale::with('products.product')->find($id);
        if (!$sale) {
            return response()->json(['success' => false, 'message' => 'Flash sale not found', 'data' => null], 404);
        }
        return response()->json(['success' => true, 'message' => 'Flash sale retrieved', 'data' => new FlashSaleResource($sale)]);
    }

    public function store(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'title' => 'required|string|max:255',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'status' => 'nullable|in:active,inactive',
        ]);
        $sale = FlashSale::create($validated);
        return response()->json(['success' => true, 'message' => 'Flash sale created', 'data' => new FlashSaleResource($sale)], 201);
    }

    public function addProduct(Request $req, string $id): JsonResponse
    {
        $sale = FlashSale::find($id);
        if (!$sale) {
            return response()->json(['success' => false, 'message' => 'Flash sale not found', 'data' => null], 404);
        }
        $validated = $req->validate([
            'product_id' => 'required|exists:products,id',
            'price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:1',
        ]);
        $validated['flash_sale_id'] = $id;
        $product = FlashSaleProduct::create($validated);
        return response()->json(['success' => true, 'message' => 'Product added to flash sale', 'data' => $product], 201);
    }
}
