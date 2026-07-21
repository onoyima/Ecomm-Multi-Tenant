<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\SearchHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function suggestions(Request $req): JsonResponse
    {
        $validated = $req->validate(['query' => 'required|string|min:2|max:255']);
        $products = Product::whereNull('deleted_at')
            ->where('name', 'like', "%{$validated['query']}%")
            ->select('id', 'name', 'price')
            ->limit(10)
            ->get();
        if ($req->user()) {
            SearchHistory::create([
                'user_id' => $req->user()->id,
                'query' => $validated['query'],
            ]);
        }
        return response()->json(['success' => true, 'message' => 'Suggestions', 'data' => $products]);
    }

    public function history(Request $req): JsonResponse
    {
        $history = SearchHistory::where('user_id', $req->user()->id)
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();
        return response()->json(['success' => true, 'message' => 'Search history', 'data' => $history]);
    }
}
