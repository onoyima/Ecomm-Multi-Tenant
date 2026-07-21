<?php

namespace App\Listeners;

use App\Events\OrderPlaced;
use Illuminate\Contracts\Queue\ShouldQueue;

class UpdateInventoryOnOrder implements ShouldQueue
{
    public function handle(OrderPlaced $event): void
    {
        $order = $event->order;

        foreach ($order->items as $item) {
            $product = $item->product;
            if ($product) {
                $product->decrement('stock', $item->quantity);
                $product->increment('sold_count', $item->quantity);
            }
        }
    }
}
