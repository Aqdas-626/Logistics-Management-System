<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Relations\Relation;
use App\Models\Import;
use App\Models\Export;
use App\Models\Cart;
use App\Models\Swing;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Relation::morphMap([
            'import' => Import::class,
            'export' => Export::class,
            'cart' => Cart::class,
            'swing' => Swing::class,
        ]);

        Vite::prefetch(concurrency: 3);
    }
}
