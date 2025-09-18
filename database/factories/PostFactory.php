<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
use App\Models\Car;
use App\Support\CarImageLibrary;

class PostFactory extends Factory
{
    public function definition(): array
    {
        // Ensure we have a real user id (pick existing or create)
        $user = User::query()->inRandomOrder()->first() ?? User::factory()->create();
        $userId = $user->id;

        // If you keep car_id on posts: pick an existing car or create one for this user
        $car = Car::query()->inRandomOrder()->first()
            ?? Car::factory()->create(['user_id' => $userId]);

        return [
            'content' => $this->faker->paragraph(), // <-- use method, not property
            'user_id' => $userId,
            'car_id'  => $car->id,                 // remove this line if you drop car_id
            'images'  => CarImageLibrary::random($this->faker->numberBetween(1, 3)),
            'other'   => $this->faker->sentence(), // <-- use method, not property
        ];
    }
}
