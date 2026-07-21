<?php

namespace App\Models;

use App\Models\Concerns\HasUuidKey;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommissionTier extends Model
{
    use HasFactory;
    use HasUuidKey;

    protected $fillable = [
        'name',
        'rate',
        'min_orders',
        'min_revenue',
        'vendor_count',
    ];

    public function commissions()
    {
        return $this->hasMany(Commission::class);
    }
}
