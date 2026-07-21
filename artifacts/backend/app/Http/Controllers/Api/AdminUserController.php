<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    use FlattensPagination;

    public function index(Request $req): JsonResponse
    {
        if ($req->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized', 'data' => null], 403);
        }
        $query = User::with('vendor', 'wallet');
        if ($req->search) $query->where(function ($q) use ($req) {
            $q->where('name', 'like', "%{$req->search}%")
              ->orWhere('email', 'like', "%{$req->search}%");
        });
        if ($req->role) $query->where('role', $req->role);
        $users = $query->orderBy('created_at', 'desc')->paginate($req->per_page ?? 15);
        return $this->paginatedResponse($users, 'Users retrieved', UserResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $user = User::with('vendor', 'wallet', 'addresses')->find($id);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found', 'data' => null], 404);
        }
        return response()->json(['success' => true, 'message' => 'User details', 'data' => new UserResource($user)]);
    }

    public function suspend(string $id): JsonResponse
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found', 'data' => null], 404);
        }
        $user->update(['is_active' => false]);
        return response()->json(['success' => true, 'message' => 'User suspended', 'data' => new UserResource($user->fresh())]);
    }

    public function activate(string $id): JsonResponse
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found', 'data' => null], 404);
        }
        $user->update(['is_active' => true]);
        return response()->json(['success' => true, 'message' => 'User activated', 'data' => new UserResource($user->fresh())]);
    }
}
