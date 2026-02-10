<?php

namespace App\Http\Services;

use Meilisearch\Client;

class Meili
{
    public static function client(): Client
    {
        return new Client(
            config('services.meilisearch.host'),
            config('services.meilisearch.key')
        );
    }
}
