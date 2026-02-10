<?php

namespace App\Console\Commands;

use App\Http\Services\Meili;
use Illuminate\Console\Command;

class MeiliSetup extends Command
{
    protected $signature = 'meili:setup';
    protected $description = 'Configure Meilisearch indexes';

    public function handle(): int
    {
        $index = Meili::client()->index('posts');

        // What can be searched
        $index->updateSearchableAttributes([
            'content',
            'categories',
            'other',
        ]);

        // What can be filtered (facets)
        $index->updateFilterableAttributes([
            'categories',
        ]);

        // What can be sorted
        $index->updateSortableAttributes([
            'created_at',
            'updated_at',
        ]);

        $this->info('Meilisearch index "posts" configured.');
        return 0;
    }
}
