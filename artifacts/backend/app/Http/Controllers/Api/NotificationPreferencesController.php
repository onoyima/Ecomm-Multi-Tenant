<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NotificationPreference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationPreferencesController extends Controller
{
    public function show(Request $req): JsonResponse
    {
        $preferences = NotificationPreference::firstOrCreate(
            ['user_id' => $req->user()->id],
            [
                'email_notifications' => true,
                'push_notifications' => true,
                'sms_notifications' => false,
                'order_updates' => true,
                'promotions' => false,
            ]
        );
        return response()->json(['success' => true, 'message' => 'Preferences retrieved', 'data' => $preferences]);
    }

    public function update(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'email_notifications' => 'boolean',
            'push_notifications' => 'boolean',
            'sms_notifications' => 'boolean',
            'order_updates' => 'boolean',
            'promotions' => 'boolean',
        ]);
        $preferences = NotificationPreference::updateOrCreate(
            ['user_id' => $req->user()->id],
            $validated
        );
        return response()->json(['success' => true, 'message' => 'Preferences updated', 'data' => $preferences]);
    }
}
