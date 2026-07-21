<?php

namespace App\Http\Controllers\Api;

use App\Events\VendorApproved;
use App\Http\Controllers\Controller;
use App\Http\Resources\VendorResource;
use App\Models\Vendor;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VendorController extends Controller
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
              ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$req->search}%"));
        });
        $vendors = $query->orderBy('created_at', 'desc')->paginate($req->per_page ?? 15);
        return $this->paginatedResponse($vendors, 'Vendors retrieved', VendorResource::class);
    }

    public function me(Request $req): JsonResponse
    {
        $vendor = $req->user()->vendor;
        if (!$vendor) {
            return response()->json(['success' => false, 'message' => 'No vendor profile', 'data' => null], 404);
        }
        return response()->json(['success' => true, 'message' => 'Vendor profile', 'data' => new VendorResource($vendor->load('user'))]);
    }

    public function show(string $id): JsonResponse
    {
        $vendor = Vendor::with('user', 'products.images')->find($id);
        if (!$vendor) {
            return response()->json(['success' => false, 'message' => 'Vendor not found', 'data' => null], 404);
        }
        return response()->json(['success' => true, 'message' => 'Vendor retrieved', 'data' => new VendorResource($vendor)]);
    }

    public function apply(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'shop_name' => 'required|string|max:255|unique:vendors,shop_name',
            'shop_description' => 'nullable|string',
            'bank_name' => 'nullable|string|max:255',
            'bank_account_name' => 'nullable|string|max:255',
            'bank_account_number' => 'nullable|string|max:50',
        ]);
        $vendor = Vendor::updateOrCreate(
            ['user_id' => $req->user()->id],
            array_merge($validated, ['status' => 'pending'])
        );
        return response()->json(['success' => true, 'message' => 'Application submitted', 'data' => new VendorResource($vendor->load('user'))], 201);
    }

    public function update(string $id, Request $req): JsonResponse
    {
        $vendor = Vendor::find($id);
        if (!$vendor) {
            return response()->json(['success' => false, 'message' => 'Vendor not found', 'data' => null], 404);
        }
        $user = $req->user();
        if ($user->role !== 'admin' && $vendor->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized', 'data' => null], 403);
        }
        $validated = $req->validate([
            'shop_name' => 'sometimes|string|max:255|unique:vendors,shop_name,' . $id,
            'shop_description' => 'nullable|string',
            'bank_name' => 'nullable|string|max:255',
            'bank_account_name' => 'nullable|string|max:255',
            'bank_account_number' => 'nullable|string|max:50',
        ]);
        $vendor->update($validated);
        return response()->json(['success' => true, 'message' => 'Vendor updated', 'data' => new VendorResource($vendor->fresh()->load('user'))]);
    }

    public function updateStatus(string $id, Request $req): JsonResponse
    {
        if ($req->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized', 'data' => null], 403);
        }
        $vendor = Vendor::find($id);
        if (!$vendor) {
            return response()->json(['success' => false, 'message' => 'Vendor not found', 'data' => null], 404);
        }
        $validated = $req->validate(['status' => 'required|string|in:pending,approved,rejected,suspended']);
        $vendor->update(['status' => $validated['status']]);
        if ($validated['status'] === 'approved') {
            event(new VendorApproved($vendor));
        }
        return response()->json(['success' => true, 'message' => 'Status updated', 'data' => new VendorResource($vendor->fresh()->load('user'))]);
    }

    public function stats(Request $req): JsonResponse
    {
        $vendor = $req->user()->vendor;
        if (!$vendor) {
            return response()->json(['success' => false, 'message' => 'No vendor profile', 'data' => null], 404);
        }
        $totalRevenue = OrderItem::where('vendor_id', $vendor->id)
            ->whereHas('order', fn($q) => $q->where('status', 'delivered'))
            ->sum(DB::raw('price * quantity'));
        $totalOrders = OrderItem::where('vendor_id', $vendor->id)->distinct('order_id')->count('order_id');
        $totalProducts = $vendor->products()->count();
        $averageRating = $vendor->products()->avg('rating');
        $monthlyRevenue = OrderItem::where('vendor_id', $vendor->id)
            ->whereHas('order', fn($q) => $q->where('status', 'delivered'))
            ->select(DB::raw('MONTH(created_at) as month'), DB::raw('YEAR(created_at) as year'), DB::raw('SUM(price * quantity) as revenue'))
            ->groupBy('year', 'month')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->limit(6)
            ->get();
        return response()->json([
            'success' => true,
            'message' => 'Vendor stats',
            'data' => [
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'total_products' => $totalProducts,
                'average_rating' => round($averageRating, 1),
                'monthly_revenue' => $monthlyRevenue,
            ],
        ]);
    }
}
