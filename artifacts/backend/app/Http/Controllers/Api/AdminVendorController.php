<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\VendorResource;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminVendorController extends Controller
{
    use FlattensPagination;

    public function index(Request $req): JsonResponse
    {
        if ($req->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized', 'data' => null], 403);
        }
        $query = Vendor::with('user');
        if ($req->status) $query->where('status', $req->status);
        if ($req->search) $query->where(function ($q) use ($req) {
            $q->where('shop_name', 'like', "%{$req->search}%")
              ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$req->search}%")
                  ->orWhere('email', 'like', "%{$req->search}%"));
        });
        $vendors = $query->orderBy('created_at', 'desc')->paginate($req->per_page ?? 15);
        return $this->paginatedResponse($vendors, 'Vendors retrieved', VendorResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $vendor = Vendor::with('user', 'products.images', 'products.category')->find($id);
        if (!$vendor) {
            return response()->json(['success' => false, 'message' => 'Vendor not found', 'data' => null], 404);
        }
        return response()->json(['success' => true, 'message' => 'Vendor details', 'data' => new VendorResource($vendor)]);
    }

    public function updateStatus(string $id, Request $req): JsonResponse
    {
        $vendor = Vendor::find($id);
        if (!$vendor) {
            return response()->json(['success' => false, 'message' => 'Vendor not found', 'data' => null], 404);
        }
        $validated = $req->validate(['status' => 'required|string|in:approved,rejected,suspended,pending']);
        $vendor->update(['status' => $validated['status']]);
        return response()->json(['success' => true, 'message' => 'Vendor status updated', 'data' => new VendorResource($vendor->fresh()->load('user'))]);
    }
}
