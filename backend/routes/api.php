<?php

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/test', function (): JsonResponse {
    return response()->json([
        'status' => 'ok',
        'message' => 'Base23 Laravel API is running.',
        'app' => config('app.name'),
        'timestamp' => now()->toIso8601String(),
    ]);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });

    Route::put('/user', function (Request $request) {
        $user = $request->user();
        
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'linkedin' => 'nullable|string|url|max:255',
            'goals' => 'nullable|string',
            'company_name' => 'nullable|string|max:255',
            'industry' => 'nullable|string|max:255',
            'years_of_operation' => 'nullable|string|max:255',
            'number_of_employees' => 'nullable|string|max:255',
            'company_description' => 'nullable|string',
        ]);
        
        $user->update($data);
        
        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'user' => $user
        ]);
    });

    Route::put('/user/password', function (Request $request) {
        $user = $request->user();
        
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);
        
        if (!\Illuminate\Support\Facades\Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'The provided password does not match your current password.',
                'errors' => [
                    'current_password' => ['Incorrect current password.']
                ]
            ], 422);
        }
        
        $user->update([
            'password' => \Illuminate\Support\Facades\Hash::make($request->password)
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully.'
        ]);
    });
});

