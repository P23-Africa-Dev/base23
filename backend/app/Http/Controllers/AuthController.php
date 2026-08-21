<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Handle user login.
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
                'error' => $validator->errors()->first(),
                'message' => 'Validation failed.'
            ], 422);
        }

        $credentials = $request->only('email', 'password');
        $remember = $request->boolean('remember');

        if (Auth::attempt($credentials, $remember)) {
            $request->session()->regenerate();

            return response()->json([
                'success' => true,
                'message' => 'Logged in successfully.',
                'user' => Auth::user(),
            ]);
        }

        return response()->json([
            'message' => 'Invalid credentials. Please try again.',
            'errors' => [
                'email' => ['The provided credentials do not match our records.']
            ]
        ], 422);
    }

    /**
     * Handle user registration.
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'account_type' => 'required|string|in:agent,company',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
                'error' => $validator->errors()->first(),
                'message' => 'Validation failed.'
            ], 422);
        }

        $data = $request->all();

        // Hash password
        $data['password'] = Hash::make($request->password);

        // Handle profile picture upload
        if ($request->hasFile('profile_picture')) {
            $file = $request->file('profile_picture');
            $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/profile_pictures'), $filename);
            $data['profile_picture'] = '/uploads/profile_pictures/' . $filename;
        }

        // Handle visibility settings if provided
        if ($request->has('visibilitySettings') && is_string($request->visibilitySettings)) {
            $data['visibilitySettings'] = json_decode($request->visibilitySettings, true);
        }

        $user = User::create($data);

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'success' => true,
            'message' => 'Registration successful.',
            'user' => $user,
        ]);
    }

    /**
     * Handle user logout.
     */
    public function logout(Request $request): JsonResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.'
        ]);
    }

    /**
     * Handle forgot password request.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
                'error' => $validator->errors()->first(),
                'message' => 'Validation failed.'
            ], 422);
        }

        $email = $request->email;
        $token = Str::random(60);

        // Delete any existing tokens for this email
        \Illuminate\Support\Facades\DB::table('password_reset_tokens')
            ->where('email', $email)
            ->delete();

        // Store new token
        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->insert([
            'email' => $email,
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        // Generate reset URL matching frontend routing:
        // /reset-password?token=XXX&email=YYY
        $resetUrl = url("/reset-password?token={$token}&email=" . urlencode($email));

        // Log the link in Laravel log for local retrieval
        Log::info("Password reset link generated for {$email}: {$resetUrl}");

        return response()->json([
            'success' => true,
            'message' => 'We have emailed your password reset link. Check your local laravel.log file for the reset URL.',
            'reset_url' => $resetUrl // Also returning it in response for developer convenience
        ]);
    }

    /**
     * Handle password reset.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'email' => 'required|string|email|exists:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
                'error' => $validator->errors()->first(),
                'message' => 'Validation failed.'
            ], 422);
        }

        $record = \Illuminate\Support\Facades\DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record || !Hash::check($request->token, $record->token)) {
            return response()->json([
                'errors' => [
                    'email' => ['This password reset token is invalid.']
                ],
                'message' => 'The provided reset token is invalid.'
            ], 422);
        }

        // Update password
        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        // Delete token
        \Illuminate\Support\Facades\DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully.'
        ]);
    }
}
