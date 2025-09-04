<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RoleSeeder::class);      // 1) roles
        $this->call(UserSeeder::class);      // 2) users (needs roles)

        // then anything that depends on users
        $this->call(CarSeeder::class);
        $this->call(PostSeeder::class);
        $this->call(CommentSeeder::class);
    }
}