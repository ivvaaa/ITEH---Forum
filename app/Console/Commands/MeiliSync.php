<?php

namespace App\Console\Commands;

use App\Models\Post;
use App\Http\Services\Meili;
use App\Search\PostDocument;
use Illuminate\Console\Command;

class MeiliSync extends Command
{
    protected $signature = 'meili:sync';
    protected $description = 'Sync all posts to Meilisearch';

    public function handle(): int
    {
        $posts = Post::all();
        $documents = $posts->map(fn($p) => PostDocument::fromPost($p))->toArray();

        if (empty($documents)) {
            $this->info('No posts to sync.');
            return 0;
        }

        Meili::client()->index('posts')->addDocuments($documents);
        $this->info("Synced {$posts->count()} posts to Meilisearch.");
        return 0;
    }
}
