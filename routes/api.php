<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PostsController;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
});

Route::apiResource('posts', PostsController::class); // Resource rute za postove
Route::get('/users', [UserController::class, 'index']); // Vraća sve korisnike
Route::get('/users/{id}', [UserController::class, 'show']); // Pojedinačni korisnik
