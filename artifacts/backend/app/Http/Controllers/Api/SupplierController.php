<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SupplierResource;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    use FlattensPagination;

    public function index(): JsonResponse
    {
        $suppliers = Supplier::orderBy('created_at', 'desc')->paginate(15);
        return $this->paginatedResponse($suppliers, 'Suppliers retrieved', SupplierResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $supplier = Supplier::find($id);
        if (!$supplier) {
            return response()->json(['success' => false, 'message' => 'Supplier not found', 'data' => null], 404);
        }
        return response()->json(['success' => true, 'message' => 'Supplier retrieved', 'data' => new SupplierResource($supplier)]);
    }

    public function store(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'name' => 'required|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'status' => 'nullable|in:active,inactive',
        ]);
        $supplier = Supplier::create($validated);
        return response()->json(['success' => true, 'message' => 'Supplier created', 'data' => new SupplierResource($supplier)], 201);
    }

    public function update(Request $req, string $id): JsonResponse
    {
        $supplier = Supplier::find($id);
        if (!$supplier) {
            return response()->json(['success' => false, 'message' => 'Supplier not found', 'data' => null], 404);
        }
        $validated = $req->validate([
            'name' => 'sometimes|required|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'status' => 'nullable|in:active,inactive',
        ]);
        $supplier->update($validated);
        return response()->json(['success' => true, 'message' => 'Supplier updated', 'data' => new SupplierResource($supplier)]);
    }
}
