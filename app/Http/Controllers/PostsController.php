<?php

namespace App\Http\Controllers;

use App\Models\Posts;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class PostsController extends Controller
{
    /**
     * Display a listing of the posts.
     */
    public function index()
    {
        $posts = Posts::with(['comments', 'likes', 'user', 'topic'])->get();
        return response()->json($posts);
    }

    /**
     * Store a newly created post in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
            'car_id' => 'required|exists:cars,id',
            'images' => 'nullable|string',
            'other' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $post = Posts::create([
            'content' => $request->content,
            'user_id' => Auth::id(),
            'car_id' => $request->car_id,
            'images' => $request->images,
            'other' => $request->other
        ]);

        return response()->json($post);
    }

    /**
     * Display the specified post.
     */
    public function show($id)
    {
        $post = Posts::with(['comments', 'likes', 'user', 'topic'])->findOrFail($id);
        return response()->json($post);
    }

    /**
     * Update the specified post in storage.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'sometimes|required|string',
            'car_id' => 'sometimes|required|exists:cars,id',
            'images' => 'nullable|string',
            'other' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $post = Posts::findOrFail($id);

        $post->update([
            'content' => $request->content ?? $post->content,
            'car_id' => $request->car_id ?? $post->car_id,
            'images' => $request->images,
            'other' => $request->other
        ]);

        return response()->json($post);
    }

    /**
     * Remove the specified post from storage.
     */
    public function destroy($id)
    {
        $post = Posts::findOrFail($id);
        $post->delete();

        return response()->json(['message' => 'Post deleted successfully.']);
    }
}

