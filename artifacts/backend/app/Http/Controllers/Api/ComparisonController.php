<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ComparisonController extends Controller
{
    public function compare(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'ids' => 'required|array|min:2|max:5',
            'ids.*' => 'required|exists:products,id',
        ]);
        $products = Product::with('images', 'variants', 'category', 'vendor')
            ->whereIn('id', $validated['ids'])
            ->get();
        if ($products->count() < 2) {
            return response()->json(['success' => false, 'message' => 'At least 2 products required', 'data' => null], 422);
        }
        $comparison = [
            'products' => ProductResource::collection($products),
            'attributes' => [
                'prices' => $products->pluck('price', 'name'),
                'ratings' => $products->pluck('rating', 'name'),
                'stocks' => $products->pluck('stock', 'name'),
                'vendors' => $products->mapWithKeys(fn($p) => [$p->name => $p->vendor?->shop_name]),
                'categories' => $products->mapWithKeys(fn($p) => [$p->name => $p->category?->name]),
            ],
        ];
        return response()->json(['success' => true, 'message' => 'Comparison data', 'data' => $comparison]);
    }
}
