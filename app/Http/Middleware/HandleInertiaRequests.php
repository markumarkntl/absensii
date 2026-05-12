<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? [
                    'id'            => $request->user()->id,
                    'name'          => $request->user()->name,
                    'email'         => $request->user()->email,
                    'roles'         => $request->user()->getRoleNames(),
                    'isAdmin'       => $request->user()->isAdmin(),
                    'isStudent'     => $request->user()->isStudent(),
                    'studentDetail' => $request->user()->studentDetail?->load('classroom'),
                ] : null,
                
                'student_id' => $request->user()?->studentDetail?->id,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
            ],
        ]);
    }
}