<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CouponResource;
use App\Models\Coupon;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    use FlattensPagination;

    public function index(Request $req): JsonResponse
    {
        $user = $req->user();
        $query = Coupon::query();
        if ($user->role === 'vendor') {
            $query->where('vendor_id', $user->vendor?->id);
        }
        $coupons = $query->orderBy('created_at', 'desc')->paginate($req->per_page ?? 15);
        return $this->paginatedResponse($coupons, 'Coupons retrieved', CouponResource::class);
    }

    public function store(Request $req): JsonResponse
    {
        $user = $req->user();
        $validated = $req->validate([
            'code' => 'required|string|max:50|unique:coupons,code',
            'type' => 'required|string|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:0',
            'max_uses_per_user' => 'nullable|integer|min:0',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:starts_at',
            'is_active' => 'boolean',
        ]);
        if ($user->role === 'vendor') {
            $validated['vendor_id'] = $user->vendor?->id;
        }
        $coupon = Coupon::create($validated);
        return response()->json(['success' => true, 'message' => 'Coupon created', 'data' => new CouponResource($coupon)], 201);
    }

    public function show(string $id): JsonResponse
    {
        $coupon = Coupon::find($id);
        if (!$coupon) {
            return response()->json(['success' => false, 'message' => 'Coupon not found', 'data' => null], 404);
        }
        return response()->json(['success' => true, 'message' => 'Coupon details', 'data' => new CouponResource($coupon)]);
    }

    public function update(string $id, Request $req): JsonResponse
    {
        $coupon = Coupon::find($id);
        if (!$coupon) {
            return response()->json(['success' => false, 'message' => 'Coupon not found', 'data' => null], 404);
        }
        $user = $req->user();
        if ($user->role === 'vendor' && $coupon->vendor_id !== $user->vendor?->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized', 'data' => null], 403);
        }
        $validated = $req->validate([
            'type' => 'sometimes|string|in:percentage,fixed',
            'value' => 'sometimes|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:0',
            'max_uses_per_user' => 'nullable|integer|min:0',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:starts_at',
            'is_active' => 'boolean',
        ]);
        $coupon->update($validated);
        return response()->json(['success' => true, 'message' => 'Coupon updated', 'data' => new CouponResource($coupon->fresh())]);
    }

    public function destroy(string $id): JsonResponse
    {
        $coupon = Coupon::find($id);
        if (!$coupon) {
            return response()->json(['success' => false, 'message' => 'Coupon not found', 'data' => null], 404);
        }
        $coupon->delete();
        return response()->json(['success' => true, 'message' => 'Coupon deleted', 'data' => null]);
    }

    public function validate(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'code' => 'required|string|max:50',
            'amount' => 'required|numeric|min:0',
        ]);
        $coupon = Coupon::where('code', $validated['code'])->where('is_active', true)->first();
        if (!$coupon) {
            return response()->json(['success' => false, 'message' => 'Invalid coupon code', 'data' => null], 404);
        }
        if ($coupon->expires_at && Carbon::parse($coupon->expires_at)->isPast()) {
            return response()->json(['success' => false, 'message' => 'Coupon has expired', 'data' => null], 422);
        }
        if ($coupon->starts_at && Carbon::parse($coupon->starts_at)->isFuture()) {
            return response()->json(['success' => false, 'message' => 'Coupon is not yet active', 'data' => null], 422);
        }
        if ($coupon->max_uses && $coupon->used_count >= $coupon->max_uses) {
            return response()->json(['success' => false, 'message' => 'Coupon usage limit reached', 'data' => null], 422);
        }
        if ($coupon->min_order_amount && $validated['amount'] < $coupon->min_order_amount) {
            return response()->json(['success' => false, 'message' => 'Minimum order amount not met', 'data' => null], 422);
        }
        $discount = $coupon->type === 'percentage'
            ? ($validated['amount'] * $coupon->value / 100)
            : $coupon->value;
        return response()->json([
            'success' => true,
            'message' => 'Coupon is valid',
            'data' => ['coupon' => new CouponResource($coupon), 'discount' => $discount],
        ]);
    }
}
