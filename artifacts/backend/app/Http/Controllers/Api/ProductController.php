<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\SupabaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    use FlattensPagination;

    public function index(Request $req): JsonResponse
    {
        $query = Product::whereNull('deleted_at')->with('vendor', 'images');
        if ($req->category) $query->where('category', $req->category);
        if ($req->search) $query->where(function ($q) use ($req) {
            $q->where('title', 'ilike', "%{$req->search}%")
              ->orWhere('description', 'ilike', "%{$req->search}%");
        });
        if ($req->vendor_id) $query->where('vendor_id', $req->vendor_id);
        if ($req->min_price) $query->where('price', '>=', $req->min_price);
        if ($req->max_price) $query->where('price', '<=', $req->max_price);
        if ($req->is_dropshipping !== null) $query->where('is_dropshipping', filter_var($req->is_dropshipping, FILTER_VALIDATE_BOOLEAN));
        $sortField = $req->sort ?? 'created_at';
        $sortDir = $req->direction ?? 'desc';
        $query->orderBy($sortField, $sortDir);
        $products = $query->paginate($req->per_page ?? 15);
        return $this->paginatedResponse($products, 'Products retrieved', ProductResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $product = Product::with('vendor', 'images', 'variants')->find($id);
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Product not found', 'data' => null], 404);
        }
        return response()->json(['success' => true, 'message' => 'Product retrieved', 'data' => new ProductResource($product)]);
    }

    public function store(StoreProductRequest $req): JsonResponse
    {
        $vendor = $req->user()->vendor;
        if (!$vendor) {
            return response()->json(['success' => false, 'message' => 'No vendor profile', 'data' => null], 422);
        }
        $product = $vendor->products()->create($req->validated());
        $this->handleProductImages($req, $product);
        if ($req->has('variants')) {
            $product->variants()->createMany($req->variants);
        }
        return response()->json(['success' => true, 'message' => 'Product created', 'data' => new ProductResource($product->load('images', 'variants'))], 201);
    }

    public function update(string $id, UpdateProductRequest $req): JsonResponse
    {
        $product = Product::whereNull('deleted_at')->find($id);
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Product not found', 'data' => null], 404);
        }
        if ($product->vendor_id !== $req->user()->vendor?->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized', 'data' => null], 403);
        }
        $product->update($req->validated());
        if ($req->hasAny(['images', 'image_files'])) {
            $product->images()->delete();
            $this->handleProductImages($req, $product);
        }
        return response()->json(['success' => true, 'message' => 'Product updated', 'data' => new ProductResource($product->fresh()->load('images', 'variants'))]);
    }

    public function destroy(string $id): JsonResponse
    {
        $product = Product::whereNull('deleted_at')->find($id);
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Product not found', 'data' => null], 404);
        }
        if ($product->vendor_id !== Auth::user()->vendor?->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized', 'data' => null], 403);
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
