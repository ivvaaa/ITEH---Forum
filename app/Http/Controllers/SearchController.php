<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Services\Meili;

class SearchController extends Controller
{
    /**
     * Search posts using Meilisearch
     *
     * Query params:
     *  - q (string)        search query
     *  - category (string) optional category filter
     *  - sort (string)     relevance | newest
     */
    public function posts(Request $request)
    {
        $query = trim((string) $request->query('q', ''));
        $category = $request->query('category');
        $sort = $request->query('sort', 'relevance');

        // Return empty results if query is too short and no category filter
        if (strlen($query) < 1 && empty($category)) {
            return response()->json([
                'hits' => [],
                'total' => 0,
                'query' => $query,
            ]);
        }

        $params = [
            'limit' => 20,
            'attributesToHighlight' => [
                'content',
                'categories',
                'other',
            ],
            'highlightPreTag' => '<mark>',
            'highlightPostTag' => '</mark>',
        ];

        // FILTERING BY CATEGORY
        if (!empty($category)) {
            $params['filter'] = 'categories = "' . addslashes($category) . '"';
        }

        // SORTING
        if ($sort === 'newest') {
            $params['sort'] = ['created_at:desc'];
        }

        try {
            // SEARCH
            $result = Meili::client()
                ->index('posts')
                ->search($query, $params);

            return response()->json([
                'hits' => $result->getHits(),
                'total' => $result->getEstimatedTotalHits(),
                'query' => $query,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'hits' => [],
                'total' => 0,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
