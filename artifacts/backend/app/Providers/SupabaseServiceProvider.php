<?php
namespace App\Providers;
use Illuminate\Support\ServiceProvider;

class SupabaseServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton('supabase', function ($app) {
            return new \App\Services\SupabaseService();
        });
    }

    public function boot(): void
    {
        //
    }
}
