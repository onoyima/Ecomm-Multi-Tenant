<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function show(Request $req): JsonResponse
    {
        $user = $req->user()->load('vendor', 'wallet', 'addresses');
        return response()->json(['success' => true, 'message' => 'Profile retrieved', 'data' => new UserResource($user)]);
    }

    public function update(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'avatar' => 'sometimes|string|max:2048',
        ]);
        $req->user()->update($validated);
        return response()->json(['success' => true, 'message' => 'Profile updated', 'data' => new UserResource($req->user()->fresh())]);
    }

    public function updatePassword(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);
        if (!Hash::check($validated['current_password'], $req->user()->password)) {
            return response()->json(['success' => false, 'message' => 'Current password is incorrect', 'data' => null], 422);
        }
        $req->user()->update(['password' => Hash::make($validated['new_password'])]);
        return response()->json(['success' => true, 'message' => 'Password updated', 'data' => null]);
    }
}
