<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class Cashback extends Model {
    use HasUuids;
    protected $fillable = ['user_id', 'order_id', 'amount', 'type', 'status', 'credited_at', 'expires_at'];
    protected function casts(): array { return ['amount' => 'decimal:2', 'credited_at' => 'datetime', 'expires_at' => 'datetime']; }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function order(): BelongsTo { return $this->belongsTo(Order::class); }
}
