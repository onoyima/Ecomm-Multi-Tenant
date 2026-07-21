<?php

namespace App\Models;

use App\Models\Concerns\HasUuidKey;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FlashSaleProduct extends Model
{
    use HasFactory;
    use HasUuidKey;

    protected $fillable = [
        'flash_sale_id',
        'product_id',
        'sale_price',
        'quantity_limit',
        'sold_count',
    ];

    protected function casts(): array
    {
        return [
            'sale_price' => 'decimal:2',
            'quantity_limit' => 'integer',
            'sold_count' => 'integer',
        ];
    }

    public function flashSale()
    {
        return $this->belongsTo(FlashSale::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
