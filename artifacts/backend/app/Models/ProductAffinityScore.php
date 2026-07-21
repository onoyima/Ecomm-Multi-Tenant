<?php

namespace App\Models;

use App\Models\Concerns\HasUuidKey;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductAffinityScore extends Model
{
    use HasFactory;
    use HasUuidKey;

    protected $fillable = [
        'source_product_id',
        'target_product_id',
        'score',
        'type',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'decimal:4',
        ];
    }

    public function sourceProduct()
    {
        return $this->belongsTo(Product::class, 'source_product_id');
    }

    public function targetProduct()
    {
        return $this->belongsTo(Product::class, 'target_product_id');
    }
}
