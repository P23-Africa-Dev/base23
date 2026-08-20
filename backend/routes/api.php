<?php

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Route;

Route::get('/test', function (): JsonResponse {
    return response()->json([
        'status' => 'ok',
        'message' => 'NOEL Laravel API is running.',
        'app' => config('app.name'),
        'timestamp' => now()->toIso8601String(),
    ]);
});
