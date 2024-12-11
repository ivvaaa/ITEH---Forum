<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    /**
     * Display a listing of the comments.
     */
    public function index()
    {
        $comments = Comment::with(['user', 'post'])->get();
        return response()->json($comments);
    }

    /**
     * Store a newly created comment in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
            'post_id' => 'required|exists:posts,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $comment = Comment::create([
            'content' => $request->content,
            'user_id' => Auth::id(),
            'post_id' => $request->post_id,
        ]);

        return response()->json($comment);
    }

    /**
     * Display the specified comment.
     */
    public function show($id)
    {
        $comment = Comment::with(['user', 'post'])->findOrFail($id);
        return response()->json($comment);
    }

    /**
     * Update the specified comment in storage.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'sometimes|required|string',
            'post_id' => 'sometimes|required|exists:posts,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $comment = Comment::findOrFail($id);

        $comment->update([
            'content' => $request->content ?? $comment->content,
            'post_id' => $request->post_id ?? $comment->post_id,
        ]);

        return response()->json($comment);
    }

    /**
     * Remove the specified comment from storage.
     */
    public function destroy($id)
    {
        $comment = Comment::findOrFail($id);
        $comment->delete();

        return response()->json(['message' => 'Comment deleted successfully.']);
    }
}

