<?php

namespace App\Http\Services;

use Illuminate\Support\Facades\Http;

class OllamaClient
{
    public function chat(array $messages, ?string $model = null): string
    {
        $model = $model ?: config('services.ollama.model');
        $url = config('services.ollama.url');

        if (!$url || !$model) {
            throw new \RuntimeException("Ollama config missing: url={$url}, model={$model}");
        }

        try {
            $res = Http::timeout(300)
                ->connectTimeout(10)
                ->post($url . '/api/chat', [
                    'model' => $model,
                    'messages' => $messages,
                    'stream' => false,
                ]);

            if (!$res->successful()) {
                throw new \RuntimeException("Ollama error: {$res->status()} {$res->body()}");
            }

            return (string) data_get($res->json(), 'message.content', '');
        } catch (\Exception $e) {
            \Log::error('Ollama chat error', ['error' => $e->getMessage()]);
            throw $e;
        }
    }
}