<?php

namespace App\Observers;

use App\Models\Post;
use App\Http\Services\Meili;
use App\Search\PostDocument;

class PostObserver
{
    public function created(Post $p): void
    {
        try {
            Meili::client()->index('posts')->addDocuments([PostDocument::fromPost($p)]);
        } catch (\Throwable $e) {
            \Log::warning('Meilisearch sync (create) failed', [
                'post_id' => $p->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function updated(Post $p): void
    {
        try {
            Meili::client()->index('posts')->addDocuments([PostDocument::fromPost($p)]);
        } catch (\Throwable $e) {
            \Log::warning('Meilisearch sync (update) failed', [
                'post_id' => $p->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function deleted(Post $p): void
    {
        try {
            Meili::client()->index('posts')->deleteDocument($p->id);
        } catch (\Throwable $e) {
            \Log::warning('Meilisearch sync (delete) failed', [
                'post_id' => $p->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
