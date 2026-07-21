<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShippingZone;
use App\Models\ShippingRate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShippingController extends Controller
{
    public function rates(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'origin' => 'nullable|string|max:255',
            'destination' => 'required|string|max:255',
            'weight' => 'required|numeric|min:0',
        ]);
        $rates = ShippingRate::where('is_active', true)
            ->where('max_weight', '>=', $validated['weight'])
            ->orderBy('cost')
            ->get();
        return response()->json(['success' => true, 'message' => 'Shipping rates', 'data' => $rates]);
    }

    public function track(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'tracking_number' => 'required|string',
            'carrier' => 'required|string',
        ]);
        // Integrate with shipping carrier APIs
        return response()->json([
            'success' => true,
            'message' => 'Tracking info',
            'data' => [
                'tracking_number' => $validated['tracking_number'],
                'carrier' => $validated['carrier'],
                'status' => 'in_transit',
                'events' => [],
            ],
        ]);
    }

    public function zones(): JsonResponse
    {
        $zones = ShippingZone::with('rates')->where('is_active', true)->get();
        return response()->json(['success' => true, 'message' => 'Shipping zones', 'data' => $zones]);
    }
}
