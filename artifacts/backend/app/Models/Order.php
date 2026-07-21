<?php

namespace App\Models;

use App\Models\Concerns\HasUuidKey;
use Illuminate\Support\Str;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;
    use HasUuidKey;

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function (Order $order) {
            if (!$order->id) {
                $order->id = (string) Str::uuid();
            }
        });
    }

    protected $fillable = [
        'customer_id',
        'status',
        'payment_status',
        'payment_method',
        'paystack_reference',
        'subtotal',
        'shipping_fee',
        'total',
        'shipping_address',
        'tracking_number',
        'carrier',
        'estimated_delivery',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'shipping_fee' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function dispute()
    {
        return $this->hasOne(Dispute::class);
    }

    public function escrow()
    {
        return $this->hasOne(Escrow::class);
    }
}
