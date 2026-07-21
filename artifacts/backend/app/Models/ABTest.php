<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
class ABTest extends Model {
    use HasUuids;
    protected $table = 'ab_tests';
    protected $fillable = ['name', 'description', 'started_at', 'ended_at', 'status'];
    protected function casts(): array { return ['started_at' => 'datetime', 'ended_at' => 'datetime']; }
}
