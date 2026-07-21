<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EscrowResource;
use App\Models\Escrow;
use App\Services\EscrowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EscrowController extends Controller
{
    use FlattensPagination;

    public function index(Request $req): JsonResponse
    {
        $user = $req->user();
        $query = Escrow::with('order', 'buyer', 'seller');
        if ($user->role === 'vendor') {
            $query->where('seller_id', $user->id);
        } elseif ($user->role === 'customer') {
            $query->where('buyer_id', $user->id);
        }
        $escrows = $query->orderBy('created_at', 'desc')->paginate($req->per_page ?? 15);
        return $this->paginatedResponse($escrows, 'Escrows retrieved', EscrowResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $escrow = Escrow::with('order', 'buyer', 'seller.user')->find($id);
        if (!$escrow) {
            return response()->json(['success' => false, 'message' => 'Escrow not found', 'data' => null], 404);
        }
        return response()->json(['success' => true, 'message' => 'Escrow retrieved', 'data' => new EscrowResource($escrow)]);
    }

    public function store(Request $req): JsonResponse
    {
        if ($req->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized', 'data' => null], 403);
        }
        $validated = $req->validate([
            'order_id' => 'required|exists:orders,id',
            'amount' => 'required|numeric|min:0',
            'buyer_id' => 'required|exists:users,id',
            'seller_id' => 'required|exists:users,id',
        ]);
        $escrow = Escrow::create(array_merge($validated, ['status' => 'held']));
        return response()->json(['success' => true, 'message' => 'Escrow created', 'data' => new EscrowResource($escrow)], 201);
    }

    public function release(string $id, Request $req): JsonResponse
    {
        $escrow = Escrow::find($id);
        if (!$escrow) {
            return response()->json(['success' => false, 'message' => 'Escrow not found', 'data' => null], 404);
        }
        try {
            $escrowService = app(EscrowService::class);
            $escrowService->releaseFunds($escrow, $req->user()->id);
            return response()->json(['success' => true, 'message' => 'Escrow released', 'data' => null]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage(), 'data' => null], 500);
        }
    }

    public function partiallyRelease(string $id, Request $req): JsonResponse
    {
        $escrow = Escrow::find($id);
        if (!$escrow) {
            return response()->json(['success' => false, 'message' => 'Escrow not found', 'data' => null], 404);
        }
        $validated = $req->validate(['amount' => 'required|numeric|min:0']);
        try {
            $escrowService = app(EscrowService::class);
            $escrowService->partiallyRelease($escrow, (int) $validated['amount'], $req->user()->id);
            return response()->json(['success' => true, 'message' => 'Partial release completed', 'data' => null]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage(), 'data' => null], 500);
        }
    }

    public function stats(): JsonResponse
    {
        $stats = [
            'total_held' => Escrow::where('status', 'held')->sum('amount'),
            'pending_release' => Escrow::where('status', 'held')->count(),
            'disputed' => Escrow::where('status', 'disputed')->count(),
            'released_today' => Escrow::where('status', 'released')
                ->whereDate('updated_at', today())
                ->sum('amount'),
        ];
        return response()->json(['success' => true, 'message' => 'Escrow stats', 'data' => $stats]);
    }
}
