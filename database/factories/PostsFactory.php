<?php

namespace Database\Factories;
use App\Models\User; // Uvođenje User modela
use App\Models\Car; 
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Posts>
 */
class PostsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'content' => $this->faker->paragraph, // Nasumičan sadržaj
            'user_id' => User::inRandomOrder()->first()->id, // Nasumičan korisnik
            'car_id' => Car::inRandomOrder()->first()->id, // Nasumična auto
            'images' => json_encode([$this->faker->imageUrl(), $this->faker->imageUrl()]), // Nasumičan niz URL-ova slika
            'other' => $this->faker->sentence, // Nasumičan tekst za polje "other"
        ];
    }
}
