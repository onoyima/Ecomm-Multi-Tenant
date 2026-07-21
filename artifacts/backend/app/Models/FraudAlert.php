<?php

namespace App\Models;

use App\Models\Concerns\HasUuidKey;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FraudAlert extends Model
{
    use HasFactory;
    use HasUuidKey;

    protected $fillable = [
        'transaction_id',
        'order_id',
        'user_id',
        'amount',
        'risk_score',
        'risk_level',
        'reason',
        'description',
        'customer_name',
        'status',
        'action_taken',
        'actioned_by',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
        ];
    }
}
