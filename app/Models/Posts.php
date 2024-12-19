<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class Posts extends Model
{ 
    use HasFactory, HasApiTokens;

    protected $fillable = [
        'content',
        'user_id',
        'car_id', 
        'images',
        'other'
    ];
 
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
 
    public function likes()
    {
        return $this->hasMany(Like::class);
    }
 
    public function user()
    {
        return $this->belongsTo(User::class);
    }
 
    public function topic()
    {
        return $this->belongsTo(Topic::class);
    }
}
