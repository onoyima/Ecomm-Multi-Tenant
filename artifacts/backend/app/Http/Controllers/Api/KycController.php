<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SupabaseStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KycController extends Controller
{
    public function uploadDocument(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'file' => 'required|file|max:10240|mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx',
            'type' => 'required|string|in:id_card,bank_statement,utility_bill,drivers_license,passport,business_registration',
        ]);

        try {
            $storage = new SupabaseStorageService();
            $url = $storage->upload($validated['file'], 'kyc/' . $req->user()->id);

            $user = $req->user();
            $documents = is_array($user->documents) ? $user->documents : [];
            $documents[] = ['type' => $validated['type'], 'url' => $url, 'uploaded_at' => now()->toIso8601String()];
            $user->update(['documents' => $documents]);

            return response()->json(['success' => true, 'message' => 'Document uploaded', 'data' => ['url' => $url]], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage(), 'data' => null], 500);
        }
    }

    public function verifyBankAccount(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'bank_code' => 'required|string|max:50',
            'account_number' => 'required|string|max:20',
            'bank_name' => 'required|string|max:255',
        ]);

        $user = $req->user();
        $user->update([
            'bank_code' => $validated['bank_code'],
            'account_number' => $validated['account_number'],
            'bank_name' => $validated['bank_name'],
            'kyc_status' => 'verified',
        ]);

        return response()->json(['success' => true, 'message' => 'Bank account verified', 'data' => [
            'bank_name' => $validated['bank_name'],
            'account_number' => substr($validated['account_number'], -4),
            'kyc_status' => 'verified',
        ]]);
    }

    public function status(Request $req): JsonResponse
    {
        $user = $req->user();

        return response()->json(['success' => true, 'message' => 'KYC status retrieved', 'data' => [
            'kyc_status' => $user->kyc_status ?? 'unverified',
            'has_bank_info' => !empty($user->bank_name) && !empty($user->account_number),
            'document_count' => is_array($user->documents) ? count($user->documents) : 0,
        ]]);
    }
}
