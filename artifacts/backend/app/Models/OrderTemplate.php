<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class OrderTemplate extends Model {
    use HasUuids;
    protected $fillable = ['user_id', 'name', 'items', 'total_estimate'];
    protected function casts(): array { return ['items' => 'array', 'total_estimate' => 'decimal:2']; }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
