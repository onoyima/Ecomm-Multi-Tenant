<?php

namespace App\Models;

use App\Models\Concerns\HasUuidKey;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory;
    use HasUuidKey;

    protected $fillable = [
        'order_id',
        'subject',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function participants()
    {
        return $this->belongsToMany(User::class, 'conversation_participants');
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }
}
