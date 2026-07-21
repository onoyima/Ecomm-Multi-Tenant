<?php

namespace App\Models;

use App\Models\Concerns\HasUuidKey;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;
    use HasUuidKey;

    protected $fillable = [
        'wallet_id',
        'type',
        'amount',
        'description',
        'reference',
        'balance_before',
        'balance_after',
        'metadata',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'balance_before' => 'decimal:2',
            'balance_after' => 'decimal:2',
            'metadata' => 'array',
        ];
    }

    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }
}
