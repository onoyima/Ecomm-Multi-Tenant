<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
class GlobalDiscount extends Model {
    use HasUuids;
    protected $fillable = ['name', 'description', 'type', 'value', 'min_order_amount', 'starts_at', 'ends_at', 'is_active'];
    protected function casts(): array { return ['value' => 'decimal:2', 'min_order_amount' => 'decimal:2', 'starts_at' => 'datetime', 'ends_at' => 'datetime', 'is_active' => 'boolean']; }
}
