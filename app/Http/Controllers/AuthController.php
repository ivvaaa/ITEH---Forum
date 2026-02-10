<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    protected function defaultRoleId(): ?int
    {
        return Role::where('name', 'viewer')->value('id') ?? Role::min('id');
    }

    protected function googleUserRoleId(): ?int
    {
        // Google accounts should be regular users (role_id = 2); fall back to the 'user' role name
        return Role::where('name', 'user')->value('id') ?? 2;
    }

    public function register(Request $request)
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role_id' => ['nullable', 'integer', 'exists:roles,id'],
            'interests' => ['nullable', 'array'],
            'profile_photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg', 'max:2048'],
            'bio' => ['nullable', 'string', 'max:500'],
            'birthdate' => ['nullable', 'date'],
        ];

        $validated = $request->validate($rules);

        if (empty($validated['role_id'])) {
            $validated['role_id'] = \App\Models\Role::where('name', 'viewer')->value('id');
        }

        $profilePhotoPath = null;
        if ($request->hasFile('profile_photo')) {
            $profilePhotoPath = $request->file('profile_photo')->store('profile_photos', 'public');
        }

        // Create user
        $user = \App\Models\User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
            'role_id' => $validated['role_id'],
            'interests' => $validated['interests'] ?? null,
            'profile_photo' => $profilePhotoPath,
            'bio' => $validated['bio'] ?? null,
            'birthdate' => $validated['birthdate'] ?? null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful.',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ], 201);
    }
    //----------------------------------------------------------------------------------
    public function login(Request $request)
    {
        // Validacija ulaznih podataka
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        // Pronalazenje korisnika po email-u
        $user = User::where('email', $request->email)->first();

        // Provera da li postoji korisnik i da li je lozinka ispravna
        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Kreiranje tokena za prijavljenog korisnika
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user_id' => $user->id,
            'user' => $user,
        ]);
    }
    //----------------------------------------------------------------------------------

    public function logout(Request $request)
    {
        // Brisanje trenutnog tokena korisnika
        $request->user()->currentAccessToken()->delete();
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Successfully logged out',
        ]);
    }
    //----------------------------------------------------------------------------------
    public function userInfo(Request $request)
    {
        return response()->json($request->user());
    }
    //----------------------------------------------------------------------------------

    public function update(Request $request)
    {
        $user = $request->user();

        // Validacija ulaznih podataka, zabranjujuÄ‡i promenu email-a
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'password' => 'nullable|string|min:8|confirmed',
            'interests' => 'nullable|array',
            'profile_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048', // Validacija slike
            'bio' => 'nullable|string|max:500',
            'birthdate' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // sacuvaj novu profilnu sliku ako je postavljena
        if ($request->hasFile('profile_photo')) {
            // Brisanje stare slike ako postoji
            if ($user->profile_photo) {
                Storage::disk('public')->delete($user->profile_photo);
            }
            // sacuvaj novu sliku
            $user->profile_photo = $request->file('profile_photo')->store('profile_photos', 'public');
        }

        // Ažuriranje podataka korisnika
        $user->name = $request->name;
        $user->interests = $request->interests;
        $user->bio = $request->bio;
        $user->birthdate = $request->birthdate;

        // Ažuriranje lozinke ako je postavljena nova
        if ($request->password) {
            $user->password = bcrypt($request->password);
        }

        $user->save();

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user,
        ]);
    }



    public function googleRedirect(Request $request)
    {
        if (!config('services.google.client_id') || !config('services.google.client_secret') || !config('services.google.redirect')) {
            return response()->json(['message' => 'Google OAuth not configured'], 500);
        }

        $state = Str::random(40);
        $request->session()->put('google_oauth_state', $state);

        $query = http_build_query([
            'client_id' => config('services.google.client_id'),
            'redirect_uri' => config('services.google.redirect'),
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'state' => $state,
            'access_type' => 'offline',
            'prompt' => 'consent',
        ]);

        return redirect('https://accounts.google.com/o/oauth2/v2/auth?' . $query);
    }

    public function googleCallback(Request $request)
    {
        $sessionState = $request->session()->pull('google_oauth_state');
        $state = $request->query('state');
        $code = $request->query('code');

        if (!$sessionState || !$state || $state !== $sessionState) {
            return response()->json(['message' => 'Invalid state'], 401);
        }

        if (!$code) {
            return response()->json(['message' => 'Missing authorization code'], 400);
        }

        $tokenResponse = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'code' => $code,
            'client_id' => config('services.google.client_id'),
            'client_secret' => config('services.google.client_secret'),
            'redirect_uri' => config('services.google.redirect'),
            'grant_type' => 'authorization_code',
        ]);

        if ($tokenResponse->failed()) {
            Log::error('Google token exchange failed', [
                'status' => $tokenResponse->status(),
                'body' => $tokenResponse->json(),
            ]);
            return response()->json(['message' => 'Failed to exchange code', 'details' => $tokenResponse->json()], 500);
        }

        $accessToken = $tokenResponse['access_token'] ?? null;
        if (!$accessToken) {
            return response()->json(['message' => 'Missing access token'], 500);
        }

        $profileResponse = Http::withToken($accessToken)
            ->get('https://openidconnect.googleapis.com/v1/userinfo');

        if ($profileResponse->failed()) {
            return response()->json(['message' => 'Failed to fetch user profile'], 500);
        }

        $googleId = $profileResponse['sub'] ?? null;
        $email = $profileResponse['email'] ?? null;
        $name = $profileResponse['name'] ?? ($email ?: 'Google User');

        if (!$googleId || !$email) {
            return response()->json(['message' => 'Incomplete Google profile'], 500);
        }

        $user = User::where('google_id', $googleId)
            ->orWhere('email', $email)
            ->first();

        if (!$user) {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make(Str::random(32)),
                'google_id' => $googleId,
                // Google sign-ups start as regular users (role_id = 2), not viewers
                'role_id' => $this->googleUserRoleId(),
            ]);
        } else {
            if (!$user->google_id) {
                $user->google_id = $googleId;
            }
            if (!$user->name && $name) {
                $user->name = $name;
            }
            // If this is a Google-linked account stuck as viewer, promote to user (but never override admins)
            if ((int) $user->role_id === (int) ($this->defaultRoleId()) && (int) $user->role_id !== 1) {
                $user->role_id = $this->googleUserRoleId();
            }
            $user->save();
        }

        $token = $user->createToken('google-login')->plainTextToken;
        $oneTimeCode = Str::random(64);
        Cache::put(
            'google_auth_' . $oneTimeCode,
            ['token' => $token, 'user_id' => $user->id],
            now()->addMinutes(5)
        );

        $frontend = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');
        return redirect($frontend . '/auth/callback?code=' . $oneTimeCode);
    }

    public function exchangeGoogleCode(Request $request)
    {
        // Temporary diagnostics
        \Log::debug('exchangeGoogleCode payload', ['body' => $request->all()]);

        // Accept either our one-time code or a credential key (if frontend mislabels it)
        $request->validate([
            'code' => 'required_without:credential|string',
            'credential' => 'required_without:code|string',
        ]);

        $oneTimeCode = $request->input('code') ?? $request->input('credential');

        $payload = Cache::pull('google_auth_' . $oneTimeCode);
        if (!$payload) {
            return response()->json(['message' => 'Invalid or expired code'], 422);
        }

        $user = User::find($payload['user_id'] ?? null);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Return the same shape as the email/password login response
        return response()->json([
            'access_token' => $payload['token'],
            'token' => $payload['token'], // backward compatibility for existing callers
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

}
