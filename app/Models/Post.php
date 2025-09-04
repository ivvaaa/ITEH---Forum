<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'content',
        'user_id',
        'car_id',  // remove if you drop the column
        'images',
        'other',
    ];

    protected $casts = [
        'images' => 'array', // JSON <-> array
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // remove if you drop car_id
    public function car()
    {
        return $this->belongsTo(Car::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}
