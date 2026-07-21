<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'customer_id' => $this->customer_id,
            'status' => $this->status,
            'payment_status' => $this->payment_status,
            'payment_method' => $this->payment_method,
            'subtotal' => (int) $this->subtotal,
            'shipping_fee' => (int) $this->shipping_fee,
            'total' => (int) $this->total,
            'shipping_address' => $this->shipping_address,
            'tracking_number' => $this->tracking_number,
            'carrier' => $this->carrier,
            'estimated_delivery' => $this->estimated_delivery,
            'notes' => $this->notes,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'customer' => new UserResource($this->whenLoaded('customer')),
            'date' => $this->created_at?->format('M d, Y'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
