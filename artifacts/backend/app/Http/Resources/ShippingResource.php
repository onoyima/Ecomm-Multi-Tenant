<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShippingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'vendor_id' => $this->vendor_id,
            'carrier' => $this->carrier,
            'tracking_number' => $this->tracking_number,
            'status' => $this->status,
            'cost' => (int) $this->cost,
            'estimated_delivery' => $this->estimated_delivery,
            'shipped_at' => $this->shipped_at,
            'delivered_at' => $this->delivered_at,
            'proof_of_delivery' => $this->proof_of_delivery,
            'notes' => $this->notes,
            'order' => new OrderResource($this->whenLoaded('order')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
