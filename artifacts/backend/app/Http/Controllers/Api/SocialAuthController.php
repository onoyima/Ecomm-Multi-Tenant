<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\SocialAccount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    private array $supportedProviders = ['google', 'facebook', 'apple'];

    public function redirect(string $provider): JsonResponse
    {
        if (!in_array($provider, $this->supportedProviders)) {
            return response()->json(['success' => false, 'message' => 'Provider not supported', 'data' => null], 422);
        }
        $url = Socialite::driver($provider)->stateless()->redirect()->getTargetUrl();
        return response()->json(['success' => true, 'message' => 'Redirect URL', 'data' => ['url' => $url]]);
    }

    public function callback(string $provider): JsonResponse
    {
        try {
            if (!in_array($provider, $this->supportedProviders)) {
                return response()->json(['success' => false, 'message' => 'Provider not supported', 'data' => null], 422);
            }
            $socialUser = Socialite::driver($provider)->stateless()->user();
            $existingSocial = SocialAccount::where('provider', $provider)
                ->where('provider_id', $socialUser->getId())->first();
            if ($existingSocial) {
                $user = $existingSocial->user;
            } else {
                $user = User::where('email', $socialUser->getEmail())->first();
                if (!$user) {
                    $user = User::create([
                        'name' => $socialUser->getName() ?? $socialUser->getNickname(),
                        'email' => $socialUser->getEmail(),
                        'password' => bcrypt(\Illuminate\Support\Str::random(16)),
                        'role' => 'customer',
                    ]);
                }
                SocialAccount::create([
                    'user_id' => $user->id,
                    'provider' => $provider,
                    'provider_id' => $socialUser->getId(),
                    'avatar' => $socialUser->getAvatar(),
                ]);
            }
            $token = $user->createToken('auth-token')->plainTextToken;
            return response()->json([
                'success' => true,
                'message' => 'Social login successful',
                'data' => ['user' => new UserResource($user), 'token' => $token],
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage(), 'data' => null], 500);
        }
    }

    public function tokenLogin(Request $request, string $provider): JsonResponse
    {
        if (!in_array($provider, $this->supportedProviders)) {
            return response()->json(['success' => false, 'message' => 'Provider not supported', 'data' => null], 422);
        }

        $token = $request->input('token');
        if (!$token) {
            return response()->json(['success' => false, 'message' => 'Token is required', 'data' => null], 422);
        }

        try {
            $socialUser = match ($provider) {
                'google' => $this->verifyGoogleToken($token),
                'facebook' => $this->verifyFacebookToken($token),
                'apple' => $this->verifyAppleToken($token),
            };

            $existingSocial = SocialAccount::where('provider', $provider)
                ->where('provider_id', $socialUser['id'])->first();

            if ($existingSocial) {
                $user = $existingSocial->user;
            } else {
                $user = User::where('email', $socialUser['email'])->first();
                if (!$user) {
                    $user = User::create([
                        'name' => $socialUser['name'] ?? $socialUser['email'],
                        'email' => $socialUser['email'],
                        'password' => bcrypt(\Illuminate\Support\Str::random(16)),
                        'role' => 'customer',
                    ]);
                }
                SocialAccount::create([
                    'user_id' => $user->id,
                    'provider' => $provider,
                    'provider_id' => $socialUser['id'],
                    'avatar' => $socialUser['avatar'] ?? null,
                ]);
            }

            $apiToken = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Social login successful',
                'data' => ['user' => new UserResource($user), 'token' => $apiToken],
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage(), 'data' => null], 500);
        }
    }

    private function verifyGoogleToken(string $idToken): array
    {
        $response = Http::get('https://oauth2.googleapis.com/tokeninfo', ['id_token' => $idToken]);

        if ($response->failed() || ($response->json('aud') !== config('services.google.client_id') && !app()->environment('local'))) {
            throw new \Exception('Invalid Google token');
        }

        return [
            'id' => $response->json('sub'),
            'email' => $response->json('email'),
            'name' => $response->json('name'),
            'avatar' => $response->json('picture'),
        ];
    }

    private function verifyFacebookToken(string $accessToken): array
    {
        $response = Http::get('https://graph.facebook.com/me', [
            'access_token' => $accessToken,
            'fields' => 'id,name,email,picture',
        ]);

        if ($response->failed()) {
            throw new \Exception('Invalid Facebook token');
        }

        $data = $response->json();

        return [
            'id' => $data['id'],
            'email' => $data['email'] ?? $data['id'] . '@facebook.com',
            'name' => $data['name'] ?? 'Facebook User',
            'avatar' => $data['picture']['data']['url'] ?? null,
        ];
    }

    private function verifyAppleToken(string $identityToken): array
    {
        $response = Http::get('https://appleid.apple.com/auth/keys');

        if ($response->failed()) {
            throw new \Exception('Failed to fetch Apple public keys');
        }

        $keys = $response->json('keys');
        $publicKey = $keys[0] ?? null;

        if (!$publicKey) {
            throw new \Exception('No Apple public key available');
        }

        $claims = \Firebase\JWT\JWT::decode($identityToken, $publicKey, ['RS256']);
        $claims = (array) $claims;

        return [
            'id' => $claims['sub'],
            'email' => $claims['email'] ?? $claims['sub'] . '@apple.com',
            'name' => $claims['name'] ?? $claims['email'] ?? 'Apple User',
            'avatar' => null,
        ];
    }
}
