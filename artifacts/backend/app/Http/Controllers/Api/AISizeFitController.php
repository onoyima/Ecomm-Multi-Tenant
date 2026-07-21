<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\AIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class AISizeFitController extends Controller {
    private AIService $aiService;
    public function __construct(AIService $aiService) {
        $this->aiService = $aiService;
    }
    public function recommend(Request $req): JsonResponse {
        $validated = $req->validate([
            'height' => 'required|numeric|min:50|max:300',
            'weight' => 'required|numeric|min:10|max:500',
            'product_id' => 'required|exists:products,id',
        ]);
        $product = Product::find($validated['product_id']);
        try {
            $recommendation = $this->aiService->recommendSize([
                'height' => $validated['height'],
                'weight' => $validated['weight'],
                'product' => $product ? $product->toArray() : [],
            ]);
            return response()->json(['success' => true, 'message' => 'Size recommendation', 'data' => $recommendation]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage(), 'data' => null], 500);
        }
    }
}
