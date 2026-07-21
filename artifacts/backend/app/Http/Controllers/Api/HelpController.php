<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use App\Models\Announcement;
use Illuminate\Http\JsonResponse;

class HelpController extends Controller
{
    public function faqs(): JsonResponse
    {
        $faqs = Faq::where('is_active', true)
            ->orderBy('category')
            ->orderBy('display_order')
            ->get()
            ->groupBy('category');
        return response()->json(['success' => true, 'message' => 'FAQs retrieved', 'data' => $faqs]);
    }

    public function announcements(): JsonResponse
    {
        $announcements = Announcement::where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>=', now());
            })
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json(['success' => true, 'message' => 'Announcements retrieved', 'data' => $announcements]);
    }
}
