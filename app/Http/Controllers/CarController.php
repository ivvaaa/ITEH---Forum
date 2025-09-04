<?php

namespace App\Http\Controllers;

use App\Models\Car;
use Illuminate\Http\Request;

class CarController extends Controller
{
    // GET /api/cars
    public function index(Request $request)
    {
        // Ako želiš samo kola ulogovanog korisnika, odkomentariši sledeću liniju:
        // return Car::where('user_id', $request->user()->id)->orderBy('id')->get();

        return Car::with('user:id,name')
            ->orderBy('id')
            ->get();
    }

    // POST /api/cars
    public function store(Request $request)
    {
        $data = $request->validate([
            'make'  => ['required','string','max:255'],
            'model' => ['required','string','max:255'],
            'year'  => ['required','integer','between:1900,2099'],
            'color' => ['nullable','string','max:255'],
        ]);

        $data['user_id'] = $request->user()->id;

        $car = Car::create($data);

        return response()->json($car, 201);
    }

    // GET /api/cars/{car}
    public function show(Car $car)
    {
        return $car->load('user:id,name');
    }

    // PUT /api/cars/{car}
    public function update(Request $request, Car $car)
    {
        // dozvoli izmene samo vlasniku
        if ($car->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'make'  => ['sometimes','string','max:255'],
            'model' => ['sometimes','string','max:255'],
            'year'  => ['sometimes','integer','between:1900,2099'],
            
        ]);

        $car->update($data);

        return response()->json($car);
    }

    // DELETE /api/cars/{car}
    public function destroy(Request $request, Car $car)
    {
        if ($car->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $car->delete();
                return response()->json(data: ['message' => 'Car deleted successfully.']);

    }
}