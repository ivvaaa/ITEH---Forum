<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use App\Http\Resources\PostResource;
use App\Models\Comment;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class PostController extends Controller
{
    /**
     * Display a listing of the posts.
     */
    public function index(Request $request)
    {
        $query = Post::with(['user', 'car']);

        if ($request->has('car_make')) {
            $carMake = $request->input('car_make');
            $query->whereHas('car', function ($q) use ($carMake) {
                $q->where('make', 'like', "%$carMake%");
            });
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('content', 'like', "%$search%")
                    ->orWhereHas('user', function ($qu) use ($search) {
                        $qu->where('name', 'like', "%$search%")
                            ->orWhere('email', 'like', "%$search%");
                    });
            });
        }
        $perPage = $request->input('per_page', 5);
        return PostResource::collection($query->paginate($perPage));

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

        $post = Post::create([
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
        $post = Post::findOrFail($id);
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

        $post = Post::findOrFail($id);

        $post->update([
            'content' => $request->content ?? $post->content,
            'car_id' => $request->car_id ?? $post->car_id,
            'images' => $request->images,
            'other' => $request->other
        ]);

        return new PostResource($post);
    }



    public function destroy($id)
    {
        $post = Post::findOrFail($id);

        // Prvo obriši komentare vezane za post
        Comment::where('post_id', $post->id)->delete();

        // Onda obriši post
        $post->delete();

        return response()->json(['message' => 'Post and related comments deleted successfully.']);
    }
}

