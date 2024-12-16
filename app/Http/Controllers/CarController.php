<?php

namespace App\Http\Controllers;

use App\Models\Car;
use Illuminate\Http\Request;

class CarController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $cars = Car::all();
        return response()->json($cars);
    }

    /**
     * Show the form for creating a new resource.
     */
    // public function create()
    // {
    //     //
    // }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'make' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'year' => 'required|integer|min:1900|max:' . date('Y'),
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $car = Car::create([
            'make' => $request->make,
            'model' => $request->model,
            'year' => $request->year,
        ]);

        return response()->json(['message' => 'Car created successfully.', 'car' => $car], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Car $car)
    {
        $car = Car::findOrFail($id);
        return response()->json($car);
    }

    /**
     * Show the form for editing the specified resource.
     */
    // public function edit(Car $car)
    // {
    //     //
    // }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Car $car)
    {
        $validator = Validator::make($request->all(), [
            'make' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'year' => 'required|integer|min:1900|max:' . date('Y'),
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $car = Car::findOrFail($id);

        $car->update([
            'make' => $request->make,
            'model' => $request->model,
            'year' => $request->year,
        ]);

        return response()->json(['message' => 'Car updated successfully.', 'car' => $car]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Car $car)
    {
        $car = Car::findOrFail($id);
        $car->delete();

        return response()->json(['message' => 'Car deleted successfully.']);
    }
}
