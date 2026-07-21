<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::where('is_active', true)->orderBy('display_order')->get();
        return response()->json(['success' => true, 'message' => 'Categories retrieved', 'data' => CategoryResource::collection($categories)]);
    }

    public function show(string $id): JsonResponse
    {
        $category = Category::withCount('products')->find($id);
        if (!$category) {
            return response()->json(['success' => false, 'message' => 'Category not found', 'data' => null], 404);
        }
        return response()->json(['success' => true, 'message' => 'Category retrieved', 'data' => new CategoryResource($category)]);
    }
}
