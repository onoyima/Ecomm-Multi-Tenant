<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SupabaseStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function upload(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'file' => 'required|file|max:10240|mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx',
            'folder' => 'nullable|string|max:255',
        ]);
        try {
            $storage = new SupabaseStorageService();
            $url = $storage->upload($validated['file'], $validated['folder'] ?? 'uploads');
            return response()->json(['success' => true, 'message' => 'File uploaded', 'data' => ['url' => $url]], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage(), 'data' => null], 500);
        }
    }

    public function uploadMultiple(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'files' => 'required|array|max:10',
            'files.*' => 'required|file|max:10240|mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx',
            'folder' => 'nullable|string|max:255',
        ]);
        try {
            $storage = new SupabaseStorageService();
            $urls = [];
            foreach ($validated['files'] as $file) {
                $urls[] = $storage->upload($file, $validated['folder'] ?? 'uploads');
            }
            return response()->json(['success' => true, 'message' => 'Files uploaded', 'data' => ['urls' => $urls]], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage(), 'data' => null], 500);
        }
    }

    public function delete(Request $req): JsonResponse
    {
        $validated = $req->validate(['url' => 'required|string']);
        try {
            $storage = new SupabaseStorageService();
            $storage->delete($validated['url']);
            return response()->json(['success' => true, 'message' => 'File deleted', 'data' => null]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage(), 'data' => null], 500);
        }
    }
}
