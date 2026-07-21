<?php

namespace App\Models;

use App\Models\Concerns\HasUuidKey;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DropshipRequest extends Model
{
    use HasFactory;
    use HasUuidKey;

    protected $fillable = [
        'vendor_id',
        'source_url',
        'title',
        'supplier_price',
        'selling_price',
        'markup_percent',
        'category',
        'images',
        'ai_processed_data',
        'status',
        'supplier_name',
        'estimated_delivery',
        'ai_score',
    ];

    protected function casts(): array
    {
        return [
            'images' => 'array',
            'ai_processed_data' => 'array',
            'supplier_price' => 'decimal:2',
            'selling_price' => 'decimal:2',
        ];
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }
}
