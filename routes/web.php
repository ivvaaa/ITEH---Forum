<?php
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('home');
});
Route::get('/contact', function () {
    return view('contact');
});
Route::get('/about', function () {
    return view('about');
});

Route::get('/auth/google/redirect', [AuthController::class, 'googleRedirect']);
Route::get('/auth/google/callback', [AuthController::class, 'googleCallback']);

