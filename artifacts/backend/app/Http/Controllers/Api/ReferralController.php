<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Referral;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReferralController extends Controller
{
    public function index(Request $req): JsonResponse
    {
        $referrals = Referral::where('referrer_id', $req->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $referrals]);
    }

    public function store(Request $req): JsonResponse
    {
        $existing = Referral::where('referrer_id', $req->user()->id)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return response()->json([
                'success' => true,
                'message' => 'Referral code already exists',
                'data' => $existing,
            ]);
        }

        do {
            $code = strtoupper(Str::random(8));
        } while (Referral::where('referral_code', $code)->exists());

        $referral = Referral::create([
            'referrer_id' => $req->user()->id,
            'referral_code' => $code,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Referral code generated',
            'data' => $referral,
        ], 201);
    }

    public function stats(Request $req): JsonResponse
    {
        $referrals = Referral::where('referrer_id', $req->user()->id);

        return response()->json([
            'success' => true,
            'data' => [
                'totalReferrals' => (clone $referrals)->count(),
                'completedCount' => (clone $referrals)->where('status', 'completed')->count(),
                'totalEarned' => (float) (clone $referrals)->where('status', 'completed')->sum('reward_amount'),
            ],
        ]);
    }

    public function redeem(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'code' => 'required|string|max:20',
        ]);

        $referral = Referral::where('referral_code', $validated['code'])
            ->where('status', 'pending')
            ->first();

        if (!$referral) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or already used referral code',
                'data' => null,
            ], 404);
        }

        if ($referral->referrer_id === $req->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot refer yourself',
                'data' => null,
            ], 422);
        }

        $referral->update([
            'referred_id' => $req->user()->id,
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Referral code redeemed',
            'data' => $referral,
        ]);
    }
}
