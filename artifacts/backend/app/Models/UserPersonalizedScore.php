<?php

namespace App\Models;

use App\Models\Concerns\HasUuidKey;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserPersonalizedScore extends Model
{
    use HasFactory;
    use HasUuidKey;

    protected $fillable = [
        'user_id',
        'product_id',
        'score',
        'model_version',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'decimal:4',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
