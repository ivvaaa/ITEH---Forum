<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class Comment extends Model
{
    use HasFactory, HasApiToken;

    protected $fillable = [
        'content',
        'user_id',
        'post_id',
    ];

     
    public function user()
    {
        return $this->belongsTo(User::class);
    }

     
    public function post()
    {
        return $this->belongsTo(Post::class);
    }
}