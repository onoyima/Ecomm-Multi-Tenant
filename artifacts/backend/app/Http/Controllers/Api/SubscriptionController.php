<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SubscriptionPlanResource;
use App\Models\SubscriptionPlan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function index(): JsonResponse
    {
        $plans = SubscriptionPlan::where('is_active', true)->orderBy('price')->get();
        return response()->json(['success' => true, 'message' => 'Subscription plans retrieved', 'data' => SubscriptionPlanResource::collection($plans)]);
    }

    public function show(string $id): JsonResponse
    {
        $plan = SubscriptionPlan::find($id);
        if (!$plan) {
            return response()->json(['success' => false, 'message' => 'Subscription plan not found', 'data' => null], 404);
        }
        return response()->json(['success' => true, 'message' => 'Subscription plan retrieved', 'data' => new SubscriptionPlanResource($plan)]);
    }

    public function store(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration_days' => 'required|integer|min:1',
            'features' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);
        $plan = SubscriptionPlan::create($validated);
        return response()->json(['success' => true, 'message' => 'Subscription plan created', 'data' => new SubscriptionPlanResource($plan)], 201);
    }

    public function update(Request $req, string $id): JsonResponse
    {
        $plan = SubscriptionPlan::find($id);
        if (!$plan) {
            return response()->json(['success' => false, 'message' => 'Subscription plan not found', 'data' => null], 404);
        }
        $validated = $req->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'duration_days' => 'sometimes|required|integer|min:1',
            'features' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);
        $plan->update($validated);
        return response()->json(['success' => true, 'message' => 'Subscription plan updated', 'data' => new SubscriptionPlanResource($plan)]);
    }
}
