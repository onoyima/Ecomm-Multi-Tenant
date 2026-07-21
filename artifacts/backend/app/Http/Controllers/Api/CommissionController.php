<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommissionTierResource;
use App\Models\CommissionTier;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommissionController extends Controller
{
    public function index(): JsonResponse
    {
        $tiers = CommissionTier::orderBy('min_sales')->get();
        return response()->json(['success' => true, 'message' => 'Commission tiers', 'data' => CommissionTierResource::collection($tiers)]);
    }

    public function tiers(): JsonResponse
    {
        $tiers = CommissionTier::withCount('vendors')->orderBy('min_sales')->get();
        return response()->json(['success' => true, 'message' => 'Tiers with vendor counts', 'data' => CommissionTierResource::collection($tiers)]);
    }

    public function vendorRate(Request $req): JsonResponse
    {
        $vendor = $req->user()->vendor;
        if (!$vendor) {
            return response()->json(['success' => false, 'message' => 'No vendor profile', 'data' => null], 404);
        }
        $rate = $vendor->commissionTier?->rate ?? config('commission.default_rate', 5);
        return response()->json(['success' => true, 'message' => 'Commission rate', 'data' => ['rate' => $rate]]);
    }

    public function calculate(Request $req): JsonResponse
    {
        $validated = $req->validate(['amount' => 'required|numeric|min:0']);
        $vendor = $req->user()->vendor;
        $rate = $vendor?->commissionTier?->rate ?? config('commission.default_rate', 5);
        $commission = $validated['amount'] * ($rate / 100);
        return response()->json([
            'success' => true,
            'message' => 'Commission calculated',
            'data' => ['amount' => $validated['amount'], 'rate' => $rate, 'commission' => $commission],
        ]);
    }

    public function updateTier(string $id, Request $req): JsonResponse
    {
        if ($req->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized', 'data' => null], 403);
        }
        $tier = CommissionTier::find($id);
        if (!$tier) {
            return response()->json(['success' => false, 'message' => 'Tier not found', 'data' => null], 404);
        }
        $validated = $req->validate([
            'name' => 'sometimes|string|max:255',
            'rate' => 'sometimes|numeric|min:0|max:100',
            'min_sales' => 'sometimes|numeric|min:0',
            'max_sales' => 'nullable|numeric|min:0',
        ]);
        $tier->update($validated);
        return response()->json(['success' => true, 'message' => 'Tier updated', 'data' => new CommissionTierResource($tier->fresh())]);
    }
}
