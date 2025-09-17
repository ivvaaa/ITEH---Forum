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
            ->flatMap(function ($item) {
                if (is_string($item) && Str::startsWith(trim($item), '[') && Str::endsWith(trim($item), ']')) {
                    $decoded = json_decode($item, true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                        return $decoded;
                    }
                }
                return [$item];
            })
            ->map(function ($path) {
                if (!is_string($path)) {
                    return null;
                }

                $clean = trim($path, "\" \t\n\r\0\x0B");
                $clean = Str::replace('\\', '/', $clean);

                if ($clean === '' || $clean === '[]') {
                    return null;
                }

                if (Str::startsWith($clean, ['http://', 'https://'])) {
                    return $clean;
                }

                $normalized = '/' . ltrim($clean, '/');

                return URL::to($normalized);
            })
            ->filter()
            ->unique()
            ->values()
            ->all();

        $likesCount = isset($this->likes_count) ? (int) $this->likes_count : $this->likes()->count();
        $likedByCurrentUser = (bool) ($this->liked_by_current_user ?? false);

        $comments = $this->whenLoaded('comments');

        return [
            'id' => $this->id,
            'content' => $this->content,
            'images' => $images,
            'other' => $this->other,
            'category' => $this->category,
            'likes_count' => $likesCount,
            'liked_by_current_user' => $likedByCurrentUser,
            'user' => new UserResource($this->whenLoaded('user') ?? $this->user),
            'car' => new CarResource($this->whenLoaded('car') ?? $this->car),
            'comments' => $comments ? CommentResource::collection($comments) : [],
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

