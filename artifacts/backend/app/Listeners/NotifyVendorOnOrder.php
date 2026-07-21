<?php

namespace App\Listeners;

use App\Events\OrderPlaced;
use App\Models\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class NotifyVendorOnOrder implements ShouldQueue
{
    public function handle(OrderPlaced $event): void
    {
        $order = $event->order;
        $vendorIds = $order->items->pluck('vendor_id')->unique();

        foreach ($vendorIds as $vendorId) {
            if (!$vendorId) continue;
            Notification::create([
                'user_id' => $vendorId,
                'type' => 'new_order',
                'title' => 'New Order Received',
                'description' => "Order #{$order->id} has been placed.",
                'data' => ['order_id' => $order->id],
            ]);
        }
    }
}
