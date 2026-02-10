<?php

namespace App\Http\Controllers;

use App\Http\Services\OllamaClient;
use Illuminate\Http\Request;

class AiChatController extends Controller
{
    public function __construct(private OllamaClient $ollama) {}

    public function chat(Request $request)
    {
        // Change from env() to config() - more reliable
        if (!config('services.ollama.url')) {
            return response()->json(['error' => 'Ollama not configured'], 500);
        }

        $data = $request->validate([
            'message' => ['required', 'string', 'max:4000'],
            'mode' => ['nullable', 'in:ask,compose_post'],
        ]);

        $mode = $data['mode'] ?? 'ask';

        // KRAĆA poruka = brži odgovori
        $system = $mode === 'compose_post'
            ? "Napravi dobar forum post na srpskom. Budi koncizna."
            : "Ti si auto asistent na srpskom. Odgovori kratko i praktično. Za ozbiljne probleme (kočnice, upravljanje, curenje) preporuči servis.";

        $userPrompt = $mode === 'compose_post'
            ? "Napravi dobar dijagnostički post: {$data['message']}"
            : $data['message'];

        $messages = [
            ['role' => 'system', 'content' => $system],
            ['role' => 'user', 'content' => $userPrompt],
        ];

        try {
            set_time_limit(300);
            $reply = $this->ollama->chat($messages);
            return response()->json(['reply' => trim($reply)]);
        } catch (\Exception $e) {
            $errorMsg = $e->getMessage();
            if (str_contains($errorMsg, 'timeout') || str_contains($errorMsg, 'Timeout')) {
                return response()->json(['error' => 'AI je spora - pokušaj sa kraćom porukom'], 408);
            }
            return response()->json(['error' => 'Greška: ' . $errorMsg], 500);
        }
    }
}
