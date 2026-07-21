<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FraudAlertResource;
use App\Models\FraudAlert;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FraudAlertController extends Controller
{
    use FlattensPagination;

    public function index(Request $req): JsonResponse
    {
        if ($req->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized', 'data' => null], 403);
        }
        $query = FraudAlert::with('user', 'order');
        if ($req->risk_level) $query->where('risk_level', $req->risk_level);
        if ($req->status) $query->where('status', $req->status);
        $alerts = $query->orderBy('created_at', 'desc')->paginate($req->per_page ?? 15);
        return $this->paginatedResponse($alerts, 'Fraud alerts', FraudAlertResource::class);
    }

    public function show(string $id): JsonResponse
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized', 'data' => null], 403);
        }
        $alert = FraudAlert::with('user', 'order')->find($id);
        if (!$alert) {
            return response()->json(['success' => false, 'message' => 'Alert not found', 'data' => null], 404);
        }
        return response()->json(['success' => true, 'message' => 'Alert details', 'data' => new FraudAlertResource($alert)]);
    }

    public function approve(string $id): JsonResponse
    {
        $alert = FraudAlert::find($id);
        if (!$alert) {
            return response()->json(['success' => false, 'message' => 'Alert not found', 'data' => null], 404);
        }
        $alert->update(['status' => 'false_positive']);
        return response()->json(['success' => true, 'message' => 'Marked as false positive', 'data' => new FraudAlertResource($alert->fresh())]);
    }

    public function block(string $id): JsonResponse
    {
        $alert = FraudAlert::find($id);
        if (!$alert) {
            return response()->json(['success' => false, 'message' => 'Alert not found', 'data' => null], 404);
        }
        $alert->update(['status' => 'blocked']);
        return response()->json(['success' => true, 'message' => 'Blocked', 'data' => new FraudAlertResource($alert->fresh())]);
    }

    public function review(string $id): JsonResponse
    {
        $alert = FraudAlert::find($id);
        if (!$alert) {
            return response()->json(['success' => false, 'message' => 'Alert not found', 'data' => null], 404);
        }
        $alert->update(['status' => 'under_review']);
        return response()->json(['success' => true, 'message' => 'Marked for review', 'data' => new FraudAlertResource($alert->fresh())]);
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Fraud alert stats',
            'data' => [
                'pending' => FraudAlert::where('status', 'pending')->count(),
                'under_review' => FraudAlert::where('status', 'under_review')->count(),
                'false_positive' => FraudAlert::where('status', 'false_positive')->count(),
                'blocked' => FraudAlert::where('status', 'blocked')->count(),
            ],
        ]);
    }
}
