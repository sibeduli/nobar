<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \App\Http\Middleware\TrackPicSession::class,
        ]);

        // Redirect unauthenticated users based on guard
        $middleware->redirectGuestsTo(function (Request $request) {
            if ($request->is('agent/*') || $request->is('agent')) {
                return route('agent.login');
            }
            return route('pic.login');
        });

        // Redirect authenticated users away from guest routes
        $middleware->redirectUsersTo(function (Request $request) {
            if ($request->is('agent/*') || $request->is('agent')) {
                return '/agent';
            }
            return '/';
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
