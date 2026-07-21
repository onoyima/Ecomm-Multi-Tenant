<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    use FlattensPagination;

    public function index(string $productId): JsonResponse
    {
        $reviews = Review::with('user')
            ->where('product_id', $productId)
            ->whereNull('deleted_at')
            ->orderBy('created_at', 'desc')
            ->paginate(15);
        $averageRating = Review::where('product_id', $productId)->whereNull('deleted_at')->avg('rating');
        $response = $this->paginatedResponse($reviews, 'Reviews retrieved', ReviewResource::class);
        $json = $response->getData(true);
        $json['average_rating'] = round($averageRating, 1);
        $json['total_reviews'] = $reviews->total();
        return response()->json($json);
    }

    public function store(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'product_id' => 'required|exists:products,id',
            'order_id' => 'required|exists:orders,id',
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'body' => 'nullable|string',
        ]);
        $review = Review::create([
            'user_id' => $req->user()->id,
            'product_id' => $validated['product_id'],
            'order_id' => $validated['order_id'],
            'rating' => $validated['rating'],
            'title' => $validated['title'],
            'body' => $validated['body'],
        ]);
        return response()->json(['success' => true, 'message' => 'Review created', 'data' => new ReviewResource($review->load('user'))], 201);
    }

    public function update(string $id, Request $req): JsonResponse
    {
        $review = Review::where('id', $id)->where('user_id', $req->user()->id)->first();
        if (!$review) {
            return response()->json(['success' => false, 'message' => 'Review not found', 'data' => null], 404);
        }
        $validated = $req->validate([
            'rating' => 'sometimes|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'body' => 'nullable|string',
        ]);
        $review->update($validated);
        return response()->json(['success' => true, 'message' => 'Review updated', 'data' => new ReviewResource($review->fresh()->load('user'))]);
    }

    public function destroy(string $id): JsonResponse
    {
        $review = Review::where('id', $id)->where('user_id', auth()->id())->first();
        if (!$review) {
            return response()->json(['success' => false, 'message' => 'Review not found', 'data' => null], 404);
        }
        $review->delete();
        return response()->json(['success' => true, 'message' => 'Review deleted', 'data' => null]);
    }
}
