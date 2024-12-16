<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class SeedInOrder extends Command
{
    protected $signature = 'db:seed-in-order';
    protected $description = 'Run seeders in a specific order';

    public function handle()
    {
        $seeders = [
            'RolesTableSeeder',
            'UsersTableSeeder',
            'CarSeeder',
            'PostsTableSeeder',
            'CommentsTableSeeder',
        ];

        foreach ($seeders as $seeder) {
            $this->info('Seeding: ' . $seeder);
            Artisan::call('db:seed', ['--class' => $seeder]);
        }

        $this->info('All seeders have been run successfully in the specified order.');

        return 0;
    }
}

