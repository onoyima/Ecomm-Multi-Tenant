<?php

namespace App\Models;

use App\Models\Concerns\HasUuidKey;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProductView extends Model
{
    use HasFactory;
    use HasUuidKey;

    protected $fillable = [
        'user_id',
        'product_id',
        'view_count',
        'last_viewed_at',
    ];

    protected function casts(): array
    {
        return [
            'view_count' => 'integer',
            'last_viewed_at' => 'datetime',
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
