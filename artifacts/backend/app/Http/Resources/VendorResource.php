<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VendorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'shop_name' => $this->shop_name,
            'shop_description' => $this->shop_description,
            'shop_logo' => $this->shop_logo,
            'status' => $this->status,
            'commission_rate' => (float) $this->commission_rate,
            'total_revenue' => (int) $this->total_revenue,
            'total_orders' => $this->total_orders,
            'total_products' => $this->products_count ?? 0,
            'rating' => (float) $this->rating,
            'products' => ProductResource::collection($this->whenLoaded('products')),
            'created_at' => $this->created_at,
        ];
    }
}
