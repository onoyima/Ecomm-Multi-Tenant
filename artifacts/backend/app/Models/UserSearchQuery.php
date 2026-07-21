<?php

namespace App\Models;

use App\Models\Concerns\HasUuidKey;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserSearchQuery extends Model
{
    use HasFactory;
    use HasUuidKey;

    protected $fillable = [
        'user_id',
        'session_id',
        'query',
        'result_count',
        'category_filter',
    ];

    protected function casts(): array
    {
        return [
            'result_count' => 'integer',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
