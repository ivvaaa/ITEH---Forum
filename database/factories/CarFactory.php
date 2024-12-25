<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Car>
 */
class CarFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'make' => $this->faker->company, // Nasumičan proizvođač (npr. Toyota, BMW)
            'model' => $this->faker->word,   // Nasumičan model (npr. Corolla, X5)
            'year' => $this->faker->year,    // Nasumična godina proizvodnje
        ];
    }
}
