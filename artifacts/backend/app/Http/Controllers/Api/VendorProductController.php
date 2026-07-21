<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\SupabaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendorProductController extends Controller
{
    use FlattensPagination;

    public function index(Request $req): JsonResponse
    {
        $vendor = $req->user()->vendor;
        if (!$vendor) {
            return response()->json(['success' => false, 'message' => 'No vendor profile', 'data' => null], 404);
        }
        $query = $vendor->products()->with('images', 'category');
        if ($req->search) $query->where(function ($q) use ($req) {
            $q->where('name', 'like', "%{$req->search}%")
              ->orWhere('description', 'like', "%{$req->search}%");
        });
        if ($req->status !== null) $query->where('is_active', filter_var($req->status, FILTER_VALIDATE_BOOLEAN));
        $products = $query->orderBy('created_at', 'desc')->paginate($req->per_page ?? 15);
        return $this->paginatedResponse($products, 'Products retrieved', ProductResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $vendor = auth()->user()->vendor;
        if (!$vendor) {
            return response()->json(['success' => false, 'message' => 'No vendor profile', 'data' => null], 404);
        }
        $product = Product::with('images', 'variants', 'category')->where('id', $id)->where('vendor_id', $vendor->id)->first();
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Product not found', 'data' => null], 404);
        }
        return response()->json(['success' => true, 'message' => 'Product retrieved', 'data' => new ProductResource($product)]);
    }

    public function store(Request $req): JsonResponse
    {
        $vendor = $req->user()->vendor;
        if (!$vendor) {
            return response()->json(['success' => false, 'message' => 'No vendor profile', 'data' => null], 404);
        }
        $validated = $req->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'stock' => 'required|integer|min:0',
            'sku' => 'nullable|string|max:100|unique:products,sku',
            'is_dropshipping' => 'boolean',
            'images' => 'nullable|array',
            'images.*' => 'string',
            'image_files' => 'nullable|array',
            'image_files.*' => 'file|mimes:jpg,jpeg,png,gif,webp|max:10240',
            'variants' => 'nullable|array',
        ]);
        $product = $vendor->products()->create($validated);
        $this->handleProductImages($req, $product);
        if ($req->has('variants')) {
            $product->variants()->createMany($req->variants);
        }
        return response()->json(['success' => true, 'message' => 'Product created', 'data' => new ProductResource($product->load('images', 'variants', 'category'))], 201);
    }

    public function update(string $id, Request $req): JsonResponse
    {
        $vendor = $req->user()->vendor;
        if (!$vendor) {
            return response()->json(['success' => false, 'message' => 'No vendor profile', 'data' => null], 404);
        }
        $product = Product::where('id', $id)->where('vendor_id', $vendor->id)->first();
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Product not found', 'data' => null], 404);
        }
        $validated = $req->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'category_id' => 'sometimes|exists:categories,id',
            'stock' => 'sometimes|integer|min:0',
            'sku' => 'nullable|string|max:100|unique:products,sku,' . $id,
            'is_dropshipping' => 'boolean',
            'images' => 'nullable|array',
            'images.*' => 'string',
            'image_files' => 'nullable|array',
            'image_files.*' => 'file|mimes:jpg,jpeg,png,gif,webp|max:10240',
        ]);
        $product->update($validated);
        if ($req->hasAny(['images', 'image_files'])) {
            $product->images()->delete();
            $this->handleProductImages($req, $product);
        }
        return response()->json(['success' => true, 'message' => 'Product updated', 'data' => new ProductResource($product->fresh()->load('images', 'variants', 'category'))]);
    }

    public function destroy(string $id): JsonResponse
    {
        $vendor = auth()->user()->vendor;
        if (!$vendor) {
            return response()->json(['success' => false, 'message' => 'No vendor profile', 'data' => null], 404);
        }
        $product = Product::where('id', $id)->where('vendor_id', $vendor->id)->first();
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Product not found', 'data' => null], 404);
        }
        $product->delete();
        return response()->json(['success' => true, 'message' => 'Product deleted', 'data' => null]);
    }

    private function handleProductImages(Request $req, Product $product): void
    {
        $storage = new SupabaseService();
        $imageRecords = [];

        if ($req->hasFile('image_files')) {
            foreach ($req->file('image_files') as $file) {
                $path = 'products/' . $product->id . '/' . uniqid() . '.' . $file->extension();
                $url = $storage->upload($path, $file);
                if ($url) {
                    $imageRecords[] = [
                        'url' => $url,
                        'source_type' => 'upload',
                        'disk' => 'supabase',
                    ];
                }
            }
        }

        if ($req->has('images')) {
            foreach ($req->images as $url) {
                $imageRecords[] = [
                    'url' => $url,
                    'source_type' => 'url',
                    'disk' => 'external',
                ];
            }
        }

        if (!empty($imageRecords)) {
            $product->images()->createMany($imageRecords);
        }
    }
}
