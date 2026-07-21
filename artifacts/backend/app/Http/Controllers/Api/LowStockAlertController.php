<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\LowStockAlert;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class LowStockAlertController extends Controller {
    use FlattensPagination;
    public function index(Request $request): JsonResponse {
        $query = LowStockAlert::with('product', 'vendor');
        if ($request->filled('vendor_id')) $query->where('vendor_id', $request->vendor_id);
        if ($request->filled('resolved')) $query->where('resolved_at', $request->resolved === 'true' ? '!=' : '=', null);
        $alerts = $query->latest()->paginate($request->per_page ?? 20);
        return $this->paginatedResponse($alerts, 'Low stock alerts retrieved');
    }
    public function store(Request $request): JsonResponse {
        $validated = $request->validate(['product_id' => 'required|exists:products,id', 'threshold' => 'integer|min:1|max:999']);
        $product = Product::findOrFail($validated['product_id']);
        $alert = LowStockAlert::create([
            'product_id' => $product->id,
            'vendor_id' => $product->vendor_id,
            'current_stock' => $product->stock_quantity ?? 0,
            'threshold' => $validated['threshold'] ?? 10,
        ]);
        return response()->json(['success' => true, 'data' => $alert->load('product', 'vendor'), 'message' => 'Alert created'], 201);
    }
    public function resolve(string $id): JsonResponse {
        $alert = LowStockAlert::findOrFail($id);
        $alert->update(['resolved_at' => now(), 'notified' => true]);
        return response()->json(['success' => true, 'data' => $alert->load('product', 'vendor'), 'message' => 'Alert resolved']);
    }
}
