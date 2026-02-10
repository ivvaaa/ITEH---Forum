<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;

class NewsController extends Controller
{
    private const FEED_URLS = [
        'https://www.autoblog.com/rss.xml',
        'https://www.motortrend.com/feed/',
        'https://www.carscoops.com/feed/',
    ];

    public function getNews()
    {
        $articles = [];

        foreach (self::FEED_URLS as $feedUrl) {
            try {
                $response = Http::timeout(10)->get($feedUrl);
                if ($response->successful()) {
                    $articles = array_merge($articles, $this->parseRss($response->body(), $feedUrl));
                }
            } catch (\Exception $e) {
                \Log::warning("Failed to fetch feed: {$feedUrl}");
            }
        }

        if (empty($articles)) {
            return response()->json([
                'articles' => [],
                'error' => 'Trenutno nije moguce dohvatiti vesti'
            ]);
        }

        $deduped = collect($articles)
            ->uniqueBy('url')
            ->sortByDesc('published_at')
            ->take(9)
            ->values()
            ->toArray();

        return response()->json(['articles' => $deduped]);
    }

    private function parseRss($xml, $feedUrl)
    {
        try {
            $doc = new \DOMDocument();
            @$doc->loadXML($xml);
            $items = $doc->getElementsByTagName('item');
            
            if ($items->length === 0) {
                $items = $doc->getElementsByTagName('entry');
            }

            $articles = [];
            $host = parse_url($feedUrl, PHP_URL_HOST) ?? 'Auto News';
            $host = str_replace('www.', '', $host);

            foreach ($items as $item) {
                $title = $this->getNodeValue($item, 'title');
                $url = $this->getNodeValue($item, 'link');
                $summary = $this->getNodeValue($item, 'description');
                $pubDate = $this->getNodeValue($item, 'pubDate');

                if (!$title || !$url) continue;

                $articles[] = [
                    'id' => md5($url),
                    'title' => trim($title),
                    'url' => trim($url),
                    'summary' => $this->truncate(strip_tags($summary), 220),
                    'published_at' => $pubDate ? date('c', strtotime($pubDate)) : null,
                    'source' => $host,
                ];
            }

            return $articles;
        } catch (\Exception $e) {
            return [];
        }
    }

    private function getNodeValue($node, $tagName)
    {
        $elements = $node->getElementsByTagName($tagName);
        return $elements->length > 0 ? trim($elements->item(0)->textContent) : '';
    }

    private function truncate($text, $max = 200)
    {
        if (!$text) return '';
        return strlen($text) > $max ? substr($text, 0, $max - 3) . '...' : $text;
    }
}
