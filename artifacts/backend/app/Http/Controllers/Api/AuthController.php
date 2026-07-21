<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\Wallet;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function register(RegisterRequest $req): JsonResponse
    {
        try {
            DB::beginTransaction();
            $user = User::create([
                'name' => $req->name,
                'email' => $req->email,
                'phone' => $req->phone,
                'password' => Hash::make($req->password),
                'role' => 'customer',
            ]);
            Wallet::create(['user_id' => $user->id, 'balance' => 0]);
            DB::commit();
            $token = $user->createToken('auth-token')->plainTextToken;
            return response()->json([
                'success' => true,
                'message' => 'Registration successful',
                'data' => ['user' => new UserResource($user), 'token' => $token],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage(), 'data' => null], 500);
        }
    }

    public function login(LoginRequest $req): JsonResponse
    {
        if (!Auth::attempt($req->only('email', 'password'))) {
            return response()->json(['success' => false, 'message' => 'Invalid credentials', 'data' => null], 401);
        }
        $user = Auth::user();
        $token = $user->createToken('auth-token')->plainTextToken;
        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => ['user' => new UserResource($user), 'token' => $token],
        ]);
    }

    public function logout(Request $req): JsonResponse
    {
        $req->user()->currentAccessToken()->delete();
        return response()->json(['success' => true, 'message' => 'Logged out', 'data' => null]);
    }

    public function me(Request $req): JsonResponse
    {
        $user = $req->user()->load('vendor', 'wallet');
        return response()->json(['success' => true, 'message' => 'User profile', 'data' => new UserResource($user)]);
    }

    public function forgotPassword(Request $req): JsonResponse
    {
        $req->validate(['email' => 'required|email']);
        $user = User::where('email', $req->email)->first();
        if ($user) {
            // In production, send email with reset token
            $token = \Illuminate\Support\Str::random(60);
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                ['token' => Hash::make($token), 'created_at' => now()]
            );
        }
        return response()->json(['success' => true, 'message' => 'If an account exists with that email, a reset link has been sent.', 'data' => null]);
    }

    public function resetPassword(Request $req): JsonResponse
    {
        $req->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);
        $record = DB::table('password_reset_tokens')->where('email', $req->email)->first();
        if (!$record || !Hash::check($req->token, $record->token)) {
            return response()->json(['success' => false, 'message' => 'Invalid or expired reset token.', 'data' => null], 422);
        }
        $user = User::where('email', $req->email)->first();
        if ($user) {
            $user->update(['password' => $req->password]);
        }
        DB::table('password_reset_tokens')->where('email', $req->email)->delete();
        return response()->json(['success' => true, 'message' => 'Password reset successful.', 'data' => null]);
    }
}
