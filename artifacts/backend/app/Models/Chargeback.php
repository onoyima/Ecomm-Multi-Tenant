<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class Chargeback extends Model {
    use HasUuids;
    protected $fillable = ['order_id', 'customer_id', 'reason', 'evidence_urls', 'status', 'resolution', 'resolved_by'];
    protected function casts(): array { return ['evidence_urls' => 'array']; }
    public function order(): BelongsTo { return $this->belongsTo(Order::class); }
    public function customer(): BelongsTo { return $this->belongsTo(User::class, 'customer_id'); }
    public function resolver(): BelongsTo { return $this->belongsTo(User::class, 'resolved_by'); }
}
