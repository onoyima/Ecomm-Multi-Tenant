<?php

namespace App\Models;

use App\Models\Concerns\HasUuidKey;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    use HasFactory;
    use HasUuidKey;

    protected $fillable = [
        'product_id',
        'url',
        'alt_text',
        'sort_order',
        'source_type',
        'disk',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
