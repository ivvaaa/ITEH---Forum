<?php

namespace App\Http\Resources;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'profile_photo' => $this->profile_photo,
            'bio' => $this->bio,
            'interests' => $this->interests,
            'posts_count' => $this->posts_count,
            'birthdate' => $this->birthdate,
            'role' => new RoleResource($this->role), // Prikazuje povezanu ulogu
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}