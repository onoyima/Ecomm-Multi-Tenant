<?php

namespace App\Models;

use App\Models\Concerns\HasUuidKey;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;
    use HasUuidKey;

    protected $fillable = [
        'order_id',
        'product_id',
        'vendor_id',
        'title',
        'image',
        'price',
        'qty',
        'is_dropshipping',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'is_dropshipping' => 'boolean',
        ];
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class, 'vendor_id');
    }
}
