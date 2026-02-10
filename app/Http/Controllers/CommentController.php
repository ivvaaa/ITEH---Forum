<?php

namespace App\Http\Controllers;

use App\Http\Resources\CommentResource;
use App\Models\Comment;
use Illuminate\Http\Request;
use App\Notifications\PostCommentedNotification;

class CommentController extends Controller
{
    // GET /api/comments
    public function index()
    {
        return Comment::with(['user:id,name', 'post:id'])
            ->orderBy('id')
            ->get();
    }

    // POST /api/comments
    public function store(Request $request)
{
    $data = $request->validate([
        'post_id' => ['required', 'integer', 'exists:posts,id'],
        'content' => ['required', 'string', 'max:2000'],
    ]);

    $user = $request->user();

    if (!$user) {
        return response()->json(['message' => 'Unauthenticated'], 401);
    }

    if (!in_array((int) ($user->role_id ?? 0), [1, 2], true)) {
        return response()->json(['message' => 'Forbidden'], 403);
    }

    $data['user_id'] = $user->id;

    $comment = Comment::create($data)->load(['user.role']);

    // Notify post owner (not yourself)
    $comment->loadMissing('post.user');
    $post = $comment->post;
    $owner = $post?->user;

    if ($owner && $owner->id !== $user->id) {
        $preview = mb_substr($comment->content, 0, 120);

        $owner->notify(new PostCommentedNotification(
            postId: $post->id,
            postTitle: $post->title ?? 'your post',
            commenterName: $user->name ?? 'Someone',
            commentPreview: $preview
        ));
    }

    return (new CommentResource($comment))
        ->response()
        ->setStatusCode(201);
}


    // GET /api/comments/{comment}
    public function show(Comment $comment)
    {
        return $comment->load(['user:id,name', 'post:id']);
    }

    // PUT /api/comments/{comment}
    public function update(Request $request, Comment $comment)
    {
        $user = $request->user();
        $roleId = (int) ($user->role_id ?? 0);
        if ($comment->user_id !== $user->id && $roleId !== 1) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'content' => ['required', 'string', 'max:2000'],
        ]);

        $comment->update($data);

        return response()->json($comment);
    }

    // DELETE /api/comments/{comment}
    public function destroy(Request $request, Comment $comment)
    {
        $user = $request->user();
        $roleId = (int) ($user->role_id ?? 0);
        if ($comment->user_id !== $user->id && $roleId !== 1) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $comment->delete();

        return response()->json(data: ['message' => 'Comment deleted successfully.']);
    }
}

