<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminProductController extends Controller
{
    use FlattensPagination;

    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['images', 'category', 'vendor']);
        
        // Filter by moderation status
        if ($request->filled('status')) {
            if ($request->status === 'pending') {
                $query->where('is_active', false);
            } elseif ($request->status === 'approved') {
                $query->where('is_active', true);
            }
        }
        
        // Search
        if ($request->filled('q')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->q}%")
                  ->orWhere('sku', 'like', "%{$request->q}%");
            });
        }
        
        $products = $query->latest()->paginate($request->per_page ?? 20);
        
        return $this->paginatedResponse($products, 'Products retrieved', ProductResource::class);
    }
    
    public function show(string $id): JsonResponse
    {
        $product = Product::with(['images', 'variants', 'category', 'vendor'])->findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => new ProductResource($product),
        ]);
    }
    
    public function approve(string $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->update(['is_active' => true]);
        return response()->json([
            'success' => true,
            'message' => 'Product approved',
            'data' => new ProductResource($product->load(['images', 'category', 'vendor'])),
        ]);
    }
    
    public function reject(string $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->update(['is_active' => false]);
        return response()->json([
            'success' => true,
            'message' => 'Product rejected',
            'data' => new ProductResource($product->load(['images', 'category', 'vendor'])),
        ]);
    }
}
