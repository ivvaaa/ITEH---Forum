<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        $users = User::all();  //svi korisnici iz baze
        return response()->json($users);  //laravel funkcija za kreiranje laravel odgovora
    }

    public function updateRole(Request $request, $id)
    {
        // Validacija role_id parametra
        $validator = Validator::make($request->all(), [
            'role_id' => 'required|integer|exists:roles,id',  
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Pronalazenje korisnika po ID-u
        $user = User::findOrFail($id);

        // azuriranje role_id
        $user->role_id = $request->role_id;
        $user->save();  //sacuva u bazi

        return response()->json(['message' => 'User role updated - uspesno.']);
    }

    public function search(Request $request)   //dinamicko pretrazivanje
    {
        $query = User::query();

        // Pretraga na osnovu imena
        if ($request->has('name')) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        // Pretraga na osnovu email-a
        if ($request->has('email')) {
            $query->where('email', 'like', '%' . $request->email . '%');
        }

        // Pretraga na osnovu role_id
        if ($request->has('role_id')) {
            $query->where('role_id', $request->role_id);
        }

        // Vracanje rezultata pretrage
        $users = $query->get();

        return response()->json($users);
    }




}
