<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use App\Notifications\PostLikedNotification;


class PostLikeController extends Controller
{
    public function store(Request $request, Post $post)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (!in_array((int) ($user->role_id ?? 0), [1, 2], true)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $post->likes()->firstOrCreate([
            'user_id' => $user->id,
        ]);

        $post->loadMissing('user');
        $owner = $post->user;

        if ($owner && $owner->id !== $user->id) {
            $owner->notify(new PostLikedNotification(
                postId: $post->id,
                postTitle: $post->title ?? 'your post',
                likerName: $user->name ?? 'Someone'
            ));
        }

        $post->loadCount('likes');

        return response()->json([
            'liked' => true,
            'likes_count' => $post->likes_count,
        ]);
    }


    public function destroy(Request $request, Post $post)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (!in_array((int) ($user->role_id ?? 0), [1, 2], true)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $post->likes()->where('user_id', $user->id)->delete();
        $post->loadCount('likes');

        return response()->json([
            'liked' => false,
            'likes_count' => $post->likes_count,
        ]);
    }
}
