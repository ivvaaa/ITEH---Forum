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
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'content' => $this->faker->paragraph, // Nasumičan sadržaj komentara
            'user_id' => User::inRandomOrder()->first()->id, // Nasumičan korisnik
            'post_id' => Posts::inRandomOrder()->first()->id, // Nasumičan post
        ];
    }
}
