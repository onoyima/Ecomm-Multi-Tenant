<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
class SeoMeta extends Model {
    use HasUuids;
    protected $fillable = ['metaable_type', 'metaable_id', 'title', 'description', 'keywords', 'canonical_url', 'og_image'];
    protected $table = 'seo_meta';
}
