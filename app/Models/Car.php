<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Car extends Model
{
    use HasFactory;

    protected $fillable = ['make','model','year','user_id'];

    protected $casts = ['year' => 'integer'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

