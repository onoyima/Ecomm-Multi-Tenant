<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AddressResource;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $req): JsonResponse
    {
        $addresses = Address::where('user_id', $req->user()->id)->orderBy('is_default', 'desc')->orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'message' => 'Addresses retrieved', 'data' => AddressResource::collection($addresses)]);
    }

    public function show(string $id): JsonResponse
    {
        $address = Address::where('id', $id)->where('user_id', auth()->id())->first();
        if (!$address) {
            return response()->json(['success' => false, 'message' => 'Address not found', 'data' => null], 404);
        }
        return response()->json(['success' => true, 'message' => 'Address retrieved', 'data' => new AddressResource($address)]);
    }

    public function store(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'label' => 'nullable|string|max:255',
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'is_default' => 'boolean',
        ]);
        if ($validated['is_default'] ?? false) {
            Address::where('user_id', $req->user()->id)->update(['is_default' => false]);
        }
        $address = Address::create(array_merge($validated, ['user_id' => $req->user()->id]));
        return response()->json(['success' => true, 'message' => 'Address created', 'data' => new AddressResource($address)], 201);
    }

    public function update(string $id, Request $req): JsonResponse
    {
        $address = Address::where('id', $id)->where('user_id', $req->user()->id)->first();
        if (!$address) {
            return response()->json(['success' => false, 'message' => 'Address not found', 'data' => null], 404);
        }
        $validated = $req->validate([
            'label' => 'nullable|string|max:255',
            'address_line_1' => 'sometimes|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'sometimes|string|max:255',
            'state' => 'sometimes|string|max:255',
            'postal_code' => 'sometimes|string|max:20',
            'country' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
            'is_default' => 'boolean',
        ]);
        if ($validated['is_default'] ?? false) {
            Address::where('user_id', $req->user()->id)->where('id', '!=', $id)->update(['is_default' => false]);
        }
        $address->update($validated);
        return response()->json(['success' => true, 'message' => 'Address updated', 'data' => new AddressResource($address->fresh())]);
    }

    public function destroy(string $id): JsonResponse
    {
        $address = Address::where('id', $id)->where('user_id', auth()->id())->first();
        if (!$address) {
            return response()->json(['success' => false, 'message' => 'Address not found', 'data' => null], 404);
        }
        $address->delete();
        return response()->json(['success' => true, 'message' => 'Address deleted', 'data' => null]);
    }

    public function setDefault(string $id): JsonResponse
    {
        $address = Address::where('id', $id)->where('user_id', auth()->id())->first();
        if (!$address) {
            return response()->json(['success' => false, 'message' => 'Address not found', 'data' => null], 404);
        }
        Address::where('user_id', $address->user_id)->update(['is_default' => false]);
        $address->update(['is_default' => true]);
        return response()->json(['success' => true, 'message' => 'Default address set', 'data' => new AddressResource($address->fresh())]);
    }
}
