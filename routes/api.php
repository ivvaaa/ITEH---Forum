<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommentController;
//use App\Http\Controllers\LikeController;
use App\Http\Controllers\PostsController;
use App\Http\Controllers\CarController;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

//Route::apiResource('users', UserController::class);
Route::apiResource('cars', CarController::class);

Route::apiResource('posts', PostsController::class);
Route::apiResource('comments', CommentController::class);  //automatski kreira CRUD 

Route::middleware(['role:admin'])->group(function () {
    Route::resource('posts', PostsController::class);
});
Route::middleware(['role:korisnik'])->group(function () {
    Route::get('posts', [PostsController::class, 'index'])->name('posts.index');
    Route::get('posts/{id}', [PostsController::class, 'show'])->name('posts.show');
});
Route::middleware(['role:not guest'])->group(function () {
    Route::get('posts/public', [PostsController::class, 'publicPosts']);
});

 //Route::apiResource('cars', CarController::class);


// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::fallback(function () {
    return 'Stranica nije pronađena';
});


// Route::middleware('auth:sanctum')->group(function () {

//         //AuthController
//     Route::post('/logout', [AuthController::class, 'logout']);
//     Route::get('/user', [AuthController::class, 'userInfo']);
//     Route::put('/user/update', [AuthController::class, 'update']);

//         //UserController
//     Route::get('/users', [UserController::class, 'index']);  //lista svih korisnika, dostupna samo administratorima
//     Route::put('/users/{id}/role', [UserController::class, 'updateRole']);  //poziva metodu updateRole i sa id kosrisnicima
//     Route::get('/users/search', [UserController::class, 'search']);  //za pretragu korisnika 

//         //CommentController
//     Route::apiResource('comments', CommentController::class);  //automatski kreira CRUD 

//         //PostController
//     Route::apiResource('posts', PostsController::class);
//     //Route::apiResource('cars', CarController::class);

// });
