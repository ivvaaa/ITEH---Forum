<?php

namespace Database\Factories;
use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'email_verified_at' => now(),
            'password' => Hash::make('password'), // Default password
            'remember_token' => Str::random(10),
            'role_id' => Role::inRandomOrder()->first()->id, // Nasumična uloga
            'interests' => $this->faker->words(3, true), // Nasumična interesovanja
            'profile_photo' => $this->faker->imageUrl(), // Nasumična URL slike
            'bio' => $this->faker->paragraph, // Nasumična biografija
            'posts_count' => $this->faker->numberBetween(0, 100), // Nasumičan broj postova
         //  'birthdate' => $this->faker->date(), // Nasumičan datum rođenja
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
