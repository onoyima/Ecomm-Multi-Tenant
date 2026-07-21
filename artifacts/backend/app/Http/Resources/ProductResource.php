<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'price' => (int) $this->price,
            'original_price' => (int) $this->original_price,
            'stock' => $this->stock,
            'category' => $this->category,
            'image' => $this->resolvePrimaryImage(),
            'images' => $this->images ?? [],
            'tags' => $this->tags ?? [],
            'rating' => (float) $this->rating,
            'review_count' => $this->review_count,
            'sold_count' => $this->sold_count,
            'is_dropshipping' => $this->is_dropshipping,
            'ai_optimized' => $this->ai_optimized,
            'is_active' => $this->is_active,
            'free_shipping' => $this->free_shipping ?? false,
            'variants' => $this->variants ?? [],
            'vendor' => new VendorResource($this->whenLoaded('vendor')),
            'vendor_name' => $this->vendor?->shop_name,
            'vendor_id' => $this->vendor_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
