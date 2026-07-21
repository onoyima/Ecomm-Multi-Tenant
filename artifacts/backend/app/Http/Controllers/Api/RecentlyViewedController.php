<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserProductView;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecentlyViewedController extends Controller
{
    use FlattensPagination;

    public function index(Request $req): JsonResponse
    {
        $views = UserProductView::with('product')
            ->where('user_id', $req->user()->id)
            ->orderBy('viewed_at', 'desc')
            ->paginate($req->per_page ?? 15);
        return $this->paginatedResponse($views, 'Recently viewed products retrieved');
    }

    public function store(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'product_id' => 'required|exists:products,id',
        ]);
        $userId = $req->user()->id;
        $productId = $validated['product_id'];
        UserProductView::updateOrCreate(
            ['user_id' => $userId, 'product_id' => $productId],
            ['viewed_at' => now()]
        );
        return response()->json(['success' => true, 'message' => 'Product view recorded', 'data' => null], 201);
    }
}
