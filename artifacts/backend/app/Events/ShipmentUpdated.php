<?php

namespace App\Events;

use App\Models\Shipping;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ShipmentUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Shipping $shipping;
    public string $oldStatus;
    public string $newStatus;

    public function __construct(Shipping $shipping, string $oldStatus, string $newStatus)
    {
        $this->shipping = $shipping;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
    }
}
