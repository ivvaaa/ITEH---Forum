<?php

namespace Database\Seeders;
use App\Models\Comment;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CommentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Kreiramo 10 nasumičnih komentara
        Comment::factory(10)->create();
    }
}
