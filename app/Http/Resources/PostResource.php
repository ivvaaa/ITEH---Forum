<?php

namespace App\Http\Resources;
use App\Models\Posts;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'content' => $this->content,
            'images' => $this->images,
            'other' => $this->other,
            'user' => new UserResource($this->user), // Prikazuje povezanog korisnika preko UserResource
            'car' => new CarResource($this->car), // Prikazuje povezani auto preko CarResource
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
