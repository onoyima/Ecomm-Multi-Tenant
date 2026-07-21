<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AIAssistantController extends Controller
{
    private AIService $aiService;

    public function __construct(AIService $aiService)
    {
        $this->aiService = $aiService;
    }

    public function chat(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'message' => 'required|string',
            'history' => 'nullable|array',
        ]);
        try {
            $response = $this->aiService->chat($validated['message'], $validated['history'] ?? []);
            return response()->json(['success' => true, 'message' => 'AI response', 'data' => $response]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage(), 'data' => null], 500);
        }
    }

    public function optimizeProduct(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
        ]);
        try {
            $result = $this->aiService->optimizeProduct($validated);
            return response()->json(['success' => true, 'message' => 'Product optimized', 'data' => $result]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage(), 'data' => null], 500);
        }
    }

    public function generateTitle(Request $req): JsonResponse
    {
        $validated = $req->validate(['description' => 'required|string']);
        try {
            $title = $this->aiService->generateTitle($validated['description']);
            return response()->json(['success' => true, 'message' => 'Title generated', 'data' => ['title' => $title]]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage(), 'data' => null], 500);
        }
    }

    public function generateDescription(Request $req): JsonResponse
    {
        $validated = $req->validate(['title' => 'required|string']);
        try {
            $description = $this->aiService->generateDescription($validated['title']);
            return response()->json(['success' => true, 'message' => 'Description generated', 'data' => ['description' => $description]]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage(), 'data' => null], 500);
        }
    }

    public function fraudScore(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:0',
            'ip_address' => 'nullable|string',
            'email' => 'nullable|email',
        ]);
        try {
            $score = $this->aiService->calculateFraudScore($validated);
            return response()->json(['success' => true, 'message' => 'Fraud score calculated', 'data' => $score]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage(), 'data' => null], 500);
        }
    }
}
