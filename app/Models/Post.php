<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    public const CATEGORY_OPTIONS = [
        'elektricni_automobili',
        'oldtajmeri',
        'sportski',
        'odrzavanje_i_popravka',
    ];

    protected $fillable = [
        'content',
        'user_id',
        'car_id',
        'images',
        'other',
        'category',
    ];

    protected $casts = [
        'images' => 'array',
        'category' => 'string',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function car()
    {
        return $this->belongsTo(Car::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function likes()
    {
        return $this->hasMany(PostLike::class);
    }

    public function likedByUsers()
    {
        return $this->belongsToMany(User::class, 'post_likes')->withTimestamps();
    }
}
