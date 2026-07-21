<?php

namespace App\Models;

use App\Models\Concerns\HasUuidKey;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Commission extends Model
{
    use HasFactory;
    use HasUuidKey;

    protected $fillable = [
        'vendor_id',
        'tier_id',
        'order_id',
        'rate',
        'amount',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
        ];
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function tier()
    {
        return $this->belongsTo(CommissionTier::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
