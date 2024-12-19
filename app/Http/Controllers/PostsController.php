<?php

namespace App\Http\Controllers;

use App\Models\Posts;
use Illuminate\Http\Request;
use App\Http\Resources\PostResource;
use App\Models\Comment;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class PostsController extends Controller
{
    /**
     * Display a listing of the posts.
     */
    public function index()
    {
        $posts = Posts::all();
        return PostResource::collection($posts);
    }

    /**
     * Store a newly created post in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
            'car_id' => 'required|exists:cars,id',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048', // Validate each file in the array
            'other' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $imagePaths = [];
        if ($request->has('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('images', 'public');  // This will store in storage/app/public/images
                 $imagePaths[] = 'storage/' . $path;  // Ensure the correct relative path is stored
            }       
        }

        $post = Posts::create([
            'content' => $request->content,
            'user_id' => Auth::id(),
            'car_id' => $request->car_id,
            'images' => json_encode($imagePaths), //cuva putanju koa json string
            'other' => $request->other
        ]);

        return new PostResource($post);
    }

    /**
     * Display the specified post.
     */
    public function show($id)
    {
        $post = Posts::findOrFail($id);
        return new PostResource($post);
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

        return new PostResource($post);
    }

    /**
     * Remove the specified post from storage.
     */
    public function destroy($id)
    {
        $post = Post::findOrFail($id);

        DB::transaction(function () use ($post) {
            // Prvo brisemo sve komentare povezane sa ovim postom
            Comment::where('post_id', $post->id)->delete();

            // Zatim brisemo sve lajkove povezane sa ovim postom
            Like::where('post_id', $post->id)->delete();

            // Na kraju brisemo i sam post
            $post->delete();
        });

        return response()->json(['message' => 'Post and related comments and likes deleted successfully.']);
    }
}

