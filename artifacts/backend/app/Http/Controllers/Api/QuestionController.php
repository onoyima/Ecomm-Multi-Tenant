<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\QuestionResource;
use App\Models\Question;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    use FlattensPagination;

    public function index(string $productId): JsonResponse
    {
        $questions = Question::with('user', 'answers')
            ->where('product_id', $productId)
            ->whereNull('deleted_at')
            ->orderBy('created_at', 'desc')
            ->paginate(15);
        return $this->paginatedResponse($questions, 'Questions retrieved', QuestionResource::class);
    }

    public function store(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'product_id' => 'required|exists:products,id',
            'question' => 'required|string|max:1000',
        ]);
        $question = Question::create([
            'user_id' => $req->user()->id,
            'product_id' => $validated['product_id'],
            'question' => $validated['question'],
        ]);
        return response()->json(['success' => true, 'message' => 'Question submitted', 'data' => new QuestionResource($question->load('user'))], 201);
    }

    public function answer(string $id, Request $req): JsonResponse
    {
        $question = Question::with('product')->find($id);
        if (!$question) {
            return response()->json(['success' => false, 'message' => 'Question not found', 'data' => null], 404);
        }
        $vendor = $req->user()->vendor;
        if (!$vendor || $question->product->vendor_id !== $vendor->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized', 'data' => null], 403);
        }
        $validated = $req->validate(['answer' => 'required|string|max:5000']);
        $question->update(['answer' => $validated['answer'], 'answered_at' => now()]);
        return response()->json(['success' => true, 'message' => 'Answer submitted', 'data' => new QuestionResource($question->fresh()->load('user', 'product'))]);
    }
}
