<?php

namespace Database\Factories;

use App\Models\Posts;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Comment>
 */
class CommentFactory extends Factory
{
    /** * Define the model's default state. * *
     *  @return array<string, mixed> */ 
    public function definition():
     array { $user = User::inRandomOrder()->first() ?: User::factory()->create(); 
        $post = Posts::inRandomOrder()->first() ?: Posts::factory()->create(); 
        return [ 'content' => $this->faker->paragraph, // Nasumičan sadržaj komentara 
        'user_id' => $user->id, // Nasumičan korisnik 
        'post_id' => $post->id, // Nasumičan post 
        ];
    }
}
