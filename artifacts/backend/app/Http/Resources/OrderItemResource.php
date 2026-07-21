<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'vendor_id' => $this->vendor_id,
            'title' => $this->title,
            'image' => $this->image,
            'price' => (int) $this->price,
            'qty' => $this->qty,
            'is_dropshipping' => $this->is_dropshipping,
        ];
    }
}
