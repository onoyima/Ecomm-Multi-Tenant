<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReturnRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'customer_id' => $this->customer_id,
            'vendor_id' => $this->vendor_id,
            'product_id' => $this->product_id,
            'reason' => $this->reason,
            'quantity' => $this->quantity,
            'refund_amount' => (int) $this->refund_amount,
            'status' => $this->status,
            'resolution' => $this->resolution,
            'order' => new OrderResource($this->whenLoaded('order')),
            'customer' => new UserResource($this->whenLoaded('customer')),
            'vendor' => new VendorResource($this->whenLoaded('vendor')),
            'product' => new ProductResource($this->whenLoaded('product')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
