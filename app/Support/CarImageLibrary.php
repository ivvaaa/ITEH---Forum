<?php

namespace App\Support;

class CarImageLibrary
{
    /**
     * Return a shuffled subset of fallback car image URLs.
     */
    public static function random(int $count = 3): array
    {
        $fallbacks = config('car_images.fallbacks', []);

        if (empty($fallbacks)) {
            return [];
        }

        $collection = collect($fallbacks)->filter();

        if ($collection->isEmpty()) {
            return [];
        }

        $limit = max(1, min($count, $collection->count()));

        return $collection
            ->shuffle()
            ->take($limit)
            ->values()
            ->all();
    }
}