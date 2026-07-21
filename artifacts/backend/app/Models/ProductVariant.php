<?php

namespace App\Models;

use App\Models\Concerns\HasUuidKey;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasFactory;
    use HasUuidKey;

    protected $fillable = [
        'product_id',
        'name',
        'options',
        'price_adjustment',
        'stock',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
