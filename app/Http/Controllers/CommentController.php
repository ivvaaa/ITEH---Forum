<?php

namespace App\Http\Controllers;

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

        $data['user_id'] = $request->user()->id;

        $comment = Comment::create($data);

        return response()->json($comment, 201);
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

