<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Mass assignable attributes.
     * Keep keys used by your AuthController (register/update).
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',        // single-role per user
        'interests',
        'profile_photo',
        'bio',
        'birthdate',
    ];

    /**
     * Hidden attributes in JSON responses.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Attribute casting.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'interests'         => 'array',
        'birthdate'         => 'date',
    ];

    /**
     * Relationships
     */
    public function role()
    {
        // Single role via users.role_id
        return $this->belongsTo(Role::class);
    }

    public function cars()
    {
        return $this->hasMany(Car::class);
    }

    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}

