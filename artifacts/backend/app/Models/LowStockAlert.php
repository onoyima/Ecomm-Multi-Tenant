<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class LowStockAlert extends Model {
    use HasUuids;
    protected $fillable = ['product_id', 'vendor_id', 'current_stock', 'threshold', 'notified', 'resolved_at'];
    protected function casts(): array { return ['notified' => 'boolean', 'resolved_at' => 'datetime']; }
    public function product(): BelongsTo { return $this->belongsTo(Product::class); }
    public function vendor(): BelongsTo { return $this->belongsTo(Vendor::class); }
}
