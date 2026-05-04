<?php
// app/Http/Middleware/EnsureHasRole.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureHasRole
{
    public function handle(Request $request, Closure $next, string $role): mixed
    {
        if (! $request->user()?->hasRole($role)) {
            abort(403, 'Akses ditolak.');
        }

        return $next($request);
    }
}