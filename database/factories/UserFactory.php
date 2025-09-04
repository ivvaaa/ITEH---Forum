<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use App\Models\Role;

class UserFactory extends Factory
{
    public function definition(): array
    {
        // Prefer an existing role; default to 'user' by name
        $roleId = Role::query()->inRandomOrder()->value('id')
               ?? Role::where('name','user')->value('id');

        return [
            'name'          => $this->faker->name(),
            'email'         => $this->faker->unique()->safeEmail(),
            'password'      => Hash::make('password123'),
            'role_id'       => $roleId, // never null if RoleSeeder ran
            'interests'     => $this->faker->randomElements(['cars','tech','music','sports'], 2),
            'profile_photo' => 'profile_photos/default.png',
            'bio'           => $this->faker->sentence(),
            'birthdate'     => $this->faker->date('Y-m-d', '2005-01-01'),
        ];
    }
}
