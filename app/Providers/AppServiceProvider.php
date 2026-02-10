<?php

namespace App\Providers;

use App\Models\Post;
use App\Observers\PostObserver;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Remove the line that tries to bind App\Services\OllamaClient
        // It should use the correct namespace: App\Http\Services\OllamaClient
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force alias registration for the 'role' middleware
        Route::aliasMiddleware('role', \App\Http\Middleware\RoleMiddleware::class);
        Post::observe(PostObserver::class);

    }
}

