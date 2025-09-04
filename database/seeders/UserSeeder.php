<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure roles exist (RoleSeeder must have run)
        $adminRoleId = Role::where('name','admin')->value('id');
        $userRoleId  = Role::where('name','user')->value('id');

        if (!$adminRoleId || !$userRoleId) {
            // Fail early with a clear message instead of inserting NULL role_id
            throw new ModelNotFoundException('Roles not found. Run RoleSeeder first (admin, user).');
        }

        // Fixed admin
        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name'     => 'Admin',
                'password' => Hash::make('admin123'),
                'role_id'  => $adminRoleId,
            ]
        );

        // Fixed normal user
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name'     => 'Test User',
                'password' => Hash::make('password123'),
                'role_id'  => $userRoleId,
            ]
        );

        // Extra random users (factory should set a valid role_id too)
        User::factory(10)->create();
    }
}