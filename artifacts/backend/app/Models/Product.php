<?php

namespace App\Models;

use App\Models\Concerns\HasUuidKey;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;
    use HasUuidKey;

    protected $fillable = [
        'vendor_id',
        'title',
        'description',
        'price',
        'original_price',
        'cost_price',
        'stock',
        'sold_count',
        'category',
        'images',
        'tags',
        'is_dropshipping',
        'supplier_url',
        'supplier_price',
        'markup_percent',
        'ai_optimized',
        'rating',
        'review_count',
        'is_active',
        'free_shipping',
        'seo_score',
        'meta_title',
        'meta_description',
        'variants',
    ];

    protected function casts(): array
    {
        return [
            'images' => 'array',
            'tags' => 'array',
            'variants' => 'array',
            'is_dropshipping' => 'boolean',
            'ai_optimized' => 'boolean',
            'is_active' => 'boolean',
            'free_shipping' => 'boolean',
            'price' => 'decimal:2',
            'original_price' => 'decimal:2',
        ];
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function resolvePrimaryImage(): ?string
    {
        $images = $this->images;
        if ($images instanceof \Illuminate\Database\Eloquent\Collection) {
            $images = $images->toArray();
        }
        if (empty($images) || !is_array($images)) {
            return null;
        }
        $first = $images[0] ?? null;
        if (is_string($first)) {
            return $first;
        }
        if (is_array($first)) {
            return $first['url'] ?? ($first['path'] ?? null);
        }
        return null;
    }
}
