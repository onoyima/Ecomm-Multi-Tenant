<?php

namespace App\Models;

use App\Models\Concerns\HasUuidKey;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;
    use HasUuidKey;

    protected $fillable = [
        'name',
        'contact_email',
        'contact_phone',
        'address',
        'reliability_score',
        'total_orders',
        'successful_orders',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'reliability_score' => 'decimal:2',
            'total_orders' => 'integer',
            'successful_orders' => 'integer',
        ];
    }

    public function productInventorySyncs()
    {
        return $this->hasMany(ProductInventorySync::class);
    }
}
