<?php

namespace App\Http\Controllers;

use App\Http\Resources\CommentResource;
use App\Models\Comment;
use Illuminate\Http\Request;

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

        if (!in_array((int) ($user->role_id ?? 0), [1, 2], true)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data['user_id'] = $user->id;

        $comment = Comment::create($data)->load(['user.role']);

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
        if ($comment->user_id !== $request->user()->id) {
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
        if ($comment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $comment->delete();

        return response()->json(data: ['message' => 'Comment deleted successfully.']);
    }
}

