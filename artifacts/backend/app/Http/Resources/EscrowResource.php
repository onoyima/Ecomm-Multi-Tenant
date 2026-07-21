<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EscrowResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'buyer_id' => $this->buyer_id,
            'seller_id' => $this->seller_id,
            'amount' => (int) $this->amount,
            'platform_fee' => (int) $this->platform_fee,
            'vendor_amount' => (int) $this->vendor_amount,
            'status' => $this->status,
            'released_at' => $this->released_at,
            'buyer' => new UserResource($this->whenLoaded('buyer')),
            'seller' => new VendorResource($this->whenLoaded('seller')),
            'order' => new OrderResource($this->whenLoaded('order')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
