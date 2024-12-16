<?php

namespace Database\Seeders;
use App\Models\Posts;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
       // Kreiramo 10 nasumičnih postova
       Posts::factory(10)->create();
    }
}
