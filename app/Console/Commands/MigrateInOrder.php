<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class MigrateInOrder extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'migrate:in-order';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run migrations in a specific order';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $migrations = ['2024_12_11_155219_create_roles_table',
        '0001_01_01_000000_create_users_table', 
        '0001_01_01_000001_create_cache_table', 
        '0001_01_01_000002_create_jobs_table', 
        '2024_12_11_193409_create_cars_table',
        '2024_12_11_192848_create_post_table', 
        '2024_12_11_193135_create_comments_table',
        '2024_12_12_123204_create_password_reset_token_table',  
        '2024_12_12_123133_create_session_table', 
        '2024_12_12_125612_add_extra_user', 
        '2024_12_12_192507_create_cache_table', 
        ];

        foreach ($migrations as $migration) {
            $this->info('Running migration: ' . $migration);
            Artisan::call('migrate', ['--path' => "database/migrations/{$migration}.php", '--force' => true]);
        }

        $this->info('All migrations have been run successfully in the specified order.');

        return 0;
    }
}

