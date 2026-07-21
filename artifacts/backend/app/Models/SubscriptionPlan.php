<?php

namespace App\Models;

use App\Models\Concerns\HasUuidKey;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionPlan extends Model
{
    use HasFactory;
    use HasUuidKey;

    protected $fillable = [
        'name',
        'slug',
        'price_monthly',
        'price_yearly',
        'commission_rate',
        'max_products',
        'featured_listing',
        'ai_optimization',
        'dropshipping',
        'analytics',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price_monthly' => 'decimal:2',
            'price_yearly' => 'decimal:2',
            'commission_rate' => 'decimal:2',
            'max_products' => 'integer',
            'featured_listing' => 'boolean',
            'ai_optimization' => 'boolean',
            'dropshipping' => 'boolean',
            'analytics' => 'boolean',
            'is_active' => 'boolean',
        ];
    }
}
