<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\CarController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\PasswordResetController;

// Public auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public read-only posts (adjust if you want protected)
// Route::apiResource('posts', PostController::class)->only(['index','show']);

// Any logged-in user   

Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLinkEmail']);
Route::post('/reset-password', [PasswordResetController::class, 'reset']);
Route::get('reset-password/{token}', function ($token) {
    return view('auth.reset-password', ['token' => $token]);
})->name('password.reset');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'userInfo']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::apiResource('cars', CarController::class);
    Route::apiResource('comments', CommentController::class);
    Route::apiResource('posts', PostController::class);

});

// Admin-only
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/users', [UserController::class, 'index']);                   // list users
    Route::get('/users/search', [UserController::class, 'search']);           // search
    Route::put('/users/{id}/role', [UserController::class, 'updateRole']);    // update by id
    //Route::apiResource('posts', PostController::class);

});



