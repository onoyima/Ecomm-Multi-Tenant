<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CurrencyController extends Controller
{
    public function index(): JsonResponse
    {
        $currencies = config('currencies');
        return response()->json(['success' => true, 'message' => 'Supported currencies', 'data' => $currencies]);
    }

    public function setCurrency(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'currency' => 'required|string|in:' . implode(',', array_keys(config('currencies'))),
        ]);

        $req->session()->put('currency', $validated['currency']);

        if ($req->user()) {
            $req->user()->update(['currency' => $validated['currency']]);
        }

        return response()->json(['success' => true, 'message' => 'Currency updated', 'data' => ['currency' => $validated['currency']]]);
    }
}
