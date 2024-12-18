
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\PostsController;
use App\Http\Controllers\CarController;

// Registracija i login
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::apiResource('posts', PostsController::class);
// Rute sa rolnim middleware-om

// Admin pristup (koristi middleware za admina)
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
   // Route::apiResource('posts', PostsController::class);
    Route::get('/user', [UserController::class, 'index']);
    Route::put('/user/update', [UserController::class, 'updateRole']);
    // Dodaj sve admin funkcionalnosti ovde
});

// Korisnik pristup (koristi middleware za korisnika)
Route::middleware(['auth:sanctum', 'role:korisnik'])->group(function () {
    //Route::get('posts', [PostsController::class, 'index'])->name('posts.index');
    Route::get('posts/{id}', [PostsController::class, 'show'])->name('posts.show');
    // Dodaj ostale funkcionalnosti korisnika
});

// Public posts (bilo ko može da vidi public postove)
Route::middleware('auth:sanctum')->group(function () {
   // Route::get('posts/public', [PostsController::class, 'publicPosts']);
});

// Postavljanje i korišćenje drugih API resursa
Route::apiResource('cars', CarController::class);
Route::apiResource('comments', CommentController::class);

// Fallback ruta (ako ništa drugo nije pronađeno)
Route::fallback(function () {
    return 'Stranica nije pronađena';
});

// Logout ruta (samo za autentifikovane korisnike)
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);


