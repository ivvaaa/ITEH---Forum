<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Posts extends Model
{ 
    use HasFactory;

    protected $fillable = [
        'content',
        'user_id',
        'car_id', //Ovde sam menjao iz categoryid u car_id
        'images',
        'other'
    ];
 
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
 
    public function car()
    {
        return $this->belongsTo(Car::class);
    }
}
