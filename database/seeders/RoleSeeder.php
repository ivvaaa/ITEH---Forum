<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Create canonical roles exactly once
        foreach (['admin','user','viewer'] as $name) {
            Role::firstOrCreate(['name' => $name]);
        }
    }
}
