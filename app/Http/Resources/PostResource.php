<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $rawImages = $this->images;

        if (is_string($rawImages)) {
            $decoded = json_decode($rawImages, true);
            $rawImages = json_last_error() === JSON_ERROR_NONE ? $decoded : [$rawImages];
        }

        $images = collect(is_array($rawImages) ? $rawImages : [])
            ->filter()
            ->map(function ($path) {
                if (Str::startsWith($path, ['http://', 'https://'])) {
                    return $path;
                }

                $normalized = '/' . ltrim($path, '/');

                return URL::to($normalized);
            })
            ->values()
            ->all();

        $comments = $this->whenLoaded('comments');

        return [
            'id' => $this->id,
            'content' => $this->content,
            'images' => $images,
            'other' => $this->other,
            'user' => new UserResource($this->whenLoaded('user') ?? $this->user),
            'car' => new CarResource($this->whenLoaded('car') ?? $this->car),
            'comments' => $comments ? CommentResource::collection($comments) : [],
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
