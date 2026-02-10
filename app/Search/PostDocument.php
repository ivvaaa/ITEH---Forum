<?php

namespace App\Search;

use App\Models\Post;

class PostDocument
{
    public static function fromPost(Post $p): array
    {
        return [
            'id' => $p->id,
            'content' => $p->content,
            'categories' => is_array($p->categories) ? $p->categories : [],
            'other' => $p->other,
            'created_at' => optional($p->created_at)->timestamp,
            'updated_at' => optional($p->updated_at)->timestamp,
        ];
    }
}
