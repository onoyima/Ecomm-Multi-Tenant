<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LoyaltyPoint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoyaltyPointController extends Controller
{
    public function index(Request $req): JsonResponse
    {
        $points = LoyaltyPoint::where('user_id', $req->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $points]);
    }

    public function balance(Request $req): JsonResponse
    {
        $balance = LoyaltyPoint::where('user_id', $req->user()->id)
            ->sum('points');

        return response()->json([
            'success' => true,
            'data' => ['balance' => (int) $balance],
        ]);
    }

    public function redeem(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'points' => 'required|integer|min:1',
        ]);

        $balance = LoyaltyPoint::where('user_id', $req->user()->id)
            ->sum('points');

        if ($balance < $validated['points']) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient loyalty points',
                'data' => null,
            ], 422);
        }

        $redemption = LoyaltyPoint::create([
            'user_id' => $req->user()->id,
            'points' => -$validated['points'],
            'reason' => 'points_redeemed',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Points redeemed',
            'data' => $redemption,
        ]);
    }
}
