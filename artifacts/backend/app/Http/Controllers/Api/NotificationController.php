<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    use FlattensPagination;

    public function index(Request $req): JsonResponse
    {
        $notifications = $req->user()->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate($req->per_page ?? 15);
        return $this->paginatedResponse($notifications, 'Notifications retrieved', NotificationResource::class);
    }

    public function markRead(string $id): JsonResponse
    {
        $notification = DatabaseNotification::where('id', $id)
            ->where('notifiable_id', auth()->id())
            ->first();
        if (!$notification) {
            return response()->json(['success' => false, 'message' => 'Notification not found', 'data' => null], 404);
        }
        $notification->markAsRead();
        return response()->json(['success' => true, 'message' => 'Marked as read', 'data' => new NotificationResource($notification)]);
    }

    public function markAllRead(Request $req): JsonResponse
    {
        $req->user()->unreadNotifications->markAsRead();
        return response()->json(['success' => true, 'message' => 'All marked as read', 'data' => null]);
    }

    public function destroy(string $id): JsonResponse
    {
        $notification = DatabaseNotification::where('id', $id)
            ->where('notifiable_id', auth()->id())
            ->first();
        if (!$notification) {
            return response()->json(['success' => false, 'message' => 'Notification not found', 'data' => null], 404);
        }
        $notification->delete();
        return response()->json(['success' => true, 'message' => 'Notification deleted', 'data' => null]);
    }
}
