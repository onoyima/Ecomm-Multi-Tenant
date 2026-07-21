<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\GlobalDiscount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class GlobalDiscountController extends Controller {
    public function index(): JsonResponse {
        $discounts = GlobalDiscount::where('is_active', true)->where('starts_at', '<=', now())->where('ends_at', '>=', now())->get();
        return response()->json(['success' => true, 'data' => $discounts]);
    }
    public function store(Request $request): JsonResponse {
        $validated = $request->validate(['name' => 'required|string|max:255', 'type' => 'required|in:percentage,fixed', 'value' => 'required|numeric|min:0', 'starts_at' => 'required|date', 'ends_at' => 'required|date|after:starts_at', 'min_order_amount' => 'nullable|numeric|min:0', 'is_active' => 'boolean']);
        $discount = GlobalDiscount::create($validated);
        return response()->json(['success' => true, 'data' => $discount, 'message' => 'Discount created'], 201);
    }
    public function destroy(string $id): JsonResponse {
        $discount = GlobalDiscount::findOrFail($id);
        $discount->delete();
        return response()->json(['success' => true, 'message' => 'Discount deleted']);
    }
}
