<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Services\Meili;
use App\Models\Post;
use App\Search\PostDocument;

class MeiliReindexPosts extends Command
{
    protected $signature = 'meili:reindex-posts {--chunk=500}';
    protected $description = 'Reindex posts into Meilisearch';

    public function handle(): int
    {
        $index = Meili::client()->index('posts');
        $chunk = (int) $this->option('chunk');

        Post::query()->orderBy('id')->chunk($chunk, function ($posts) use ($index) {
            $docs = $posts->map(fn($p) => PostDocument::fromPost($p))->all();
            $index->addDocuments($docs);
            $this->info('Indexed '.count($docs).' posts');
        });

        $this->info('Done.');
        return 0;
    }
}
