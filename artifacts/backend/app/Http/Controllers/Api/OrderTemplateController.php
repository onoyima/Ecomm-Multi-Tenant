<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\OrderTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class OrderTemplateController extends Controller {
    public function index(): JsonResponse {
        $templates = OrderTemplate::where('user_id', auth()->id())->latest()->get();
        return response()->json(['success' => true, 'data' => $templates]);
    }
    public function store(Request $request): JsonResponse {
        $validated = $request->validate(['name' => 'required|string|max:255', 'items' => 'required|array|min:1', 'items.*.product_id' => 'required|exists:products,id', 'items.*.quantity' => 'required|integer|min:1', 'total_estimate' => 'nullable|numeric|min:0']);
        $template = OrderTemplate::create([...$validated, 'user_id' => auth()->id()]);
        return response()->json(['success' => true, 'data' => $template, 'message' => 'Template created'], 201);
    }
    public function destroy(string $id): JsonResponse {
        $template = OrderTemplate::where('user_id', auth()->id())->findOrFail($id);
        $template->delete();
        return response()->json(['success' => true, 'message' => 'Template deleted']);
    }
}
