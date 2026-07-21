<?php

namespace App\Models;

use App\Models\Concerns\HasUuidKey;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShippingAddress extends Model
{
    use HasFactory;
    use HasUuidKey;

    protected $fillable = [
        'user_id',
        'label',
        'full_name',
        'phone',
        'street',
        'city',
        'state',
        'is_default',
    ];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
