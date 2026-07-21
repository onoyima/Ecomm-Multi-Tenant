<?php

namespace App\Models;

use App\Models\Concerns\HasUuidKey;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vendor extends Model
{
    use HasFactory;
    use HasUuidKey;

    protected $fillable = [
        'user_id',
        'shop_name',
        'shop_description',
        'shop_logo',
        'bank_name',
        'account_number',
        'account_name',
        'status',
        'commission_rate',
        'total_revenue',
        'total_orders',
        'total_products',
        'rating',
        'fraud_score',
        'verification_status',
        'documents',
    ];

    protected function casts(): array
    {
        return [
            'documents' => 'array',
            'total_revenue' => 'decimal:2',
            'commission_rate' => 'decimal:2',
            'rating' => 'decimal:2',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function orders()
    {
        return $this->hasManyThrough(Order::class, OrderItem::class, 'vendor_id', 'id', 'id', 'order_id');
    }

    public function commissions()
    {
        return $this->hasMany(Commission::class);
    }

    public function escrows()
    {
        return $this->hasMany(Escrow::class, 'seller_id');
    }

    public function payouts()
    {
        return $this->hasMany(Payout::class);
    }

    public function dropshipRequests()
    {
        return $this->hasMany(DropshipRequest::class);
    }

    public function coupons()
    {
        return $this->hasMany(Coupon::class);
    }
}
