<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\HasApiTokens;


class AuthController extends Controller
{
    public function register(Request $request)
    {
        // Validacija ulaznih podataka
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role_id' => 'required|integer',
            'interests' => 'nullable|array',
            'profile_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'bio' => 'nullable|string|max:500',
            'birthdate' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Sačuvajte profilnu sliku ako postoji
        $profilePhotoPath = null;
        if ($request->hasFile('profile_photo')) {
            $profilePhotoPath = $request->file('profile_photo')->store('profile_photos', 'public');
        }

        // Kreiranje novog korisnika
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $request->role_id,
            'interests' => $request->interests,
            'profile_photo' => $profilePhotoPath,
            'bio' => $request->bio,
            'birthdate' => $request->birthdate,
        ]);

        

        return response()->json([
            'message' => 'Registration successful.  ',
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

        // Pronalaženje korisnika po email-u
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
            'user_id'=>$user->id,
            'user'=>$user,
        ]);
    }
    //----------------------------------------------------------------------------------
    
    public function logout(Request $request)
    {
        // Brisanje trenutnog tokena korisnika
        $request->user()->currentAccessToken()->delete();

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

        // Validacija ulaznih podataka, zabranjujući promenu email-a
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

        // Sačuvajte novu profilnu sliku ako je postavljena
        if ($request->hasFile('profile_photo')) {
            // Brisanje stare slike ako postoji
            if ($user->profile_photo) {
                Storage::disk('public')->delete($user->profile_photo);
            }
            // Sačuvajte novu sliku
            $user->profile_photo = $request->file('profile_photo')->store('profile_photos', 'public');
        }

        // Ažuriranje podataka korisnika
        $user->name = $request->name;
        $user->interests = $request->interests;
        $user->bio = $request->bio;
        $user->birthdate = $request->birthdate;

        // Ažuriranje lozinke ako je postavljena nova
        if ($request->password) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user,
        ]);
    }

    //----------------------------------------------------------------------------------

}
