<?php

namespace App\Models\Concerns;

use Illuminate\Support\Str;

trait HasUuidKey
{
    public function initializeHasUuidKey(): void
    {
        $this->incrementing = false;
        $this->keyType = 'string';
    }

    public static function bootHasUuidKey(): void
    {
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }
}
