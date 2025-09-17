<?php

namespace App\Http\Controllers;

use App\Http\Resources\PostResource;
use App\Models\Car;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class PostController extends Controller
{
    /**
     * Display a listing of the posts.
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 7);

        $query = Post::with(['user', 'car'])
            ->withCount('likes');

        if ($request->user()) {
            $query->withExists(['likedByUsers as liked_by_current_user' => function ($builder) use ($request) {
                $builder->where('user_id', $request->user()->id);
            }]);
        }

        if ($request->boolean('mine')) {
            $userId = optional($request->user('sanctum'))->id ?? Auth::id();

            if (!$userId) {
                $empty = Post::with(['user', 'car'])->whereRaw('0 = 1')->paginate($perPage);
                return PostResource::collection($empty);
            }

            $query->where('user_id', $userId);
        }

        if ($request->filled('car_make')) {
            $carMake = $request->input('car_make');
            $query->whereHas('car', function ($q) use ($carMake) {
                $q->where('make', 'like', "%$carMake%")
                    ->orWhere('model', 'like', "%$carMake%");
            });
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('content', 'like', "%$search%")
                    ->orWhereHas('user', function ($qu) use ($search) {
                        $qu->where('name', 'like', "%$search%")
                            ->orWhere('email', 'like', "%$search%");
                    });
            });
        }

        $filterCategories = $this->normalizeCategories(
            $request->input('categories', $request->input('category'))
        );

        if (!empty($filterCategories)) {
            $query->where(function ($builder) use ($filterCategories) {
                foreach ($filterCategories as $category) {
                    $builder->orWhereJsonContains('categories', $category);
                }
            });
        }

        $query->orderByRaw($this->buildCategoryOrderCase())
            ->orderByDesc('created_at');

        return PostResource::collection($query->paginate($perPage));
    }

    private function buildCategoryOrderCase(): string
    {
        $cases = [];

        foreach (Post::CATEGORY_OPTIONS as $index => $value) {
            $cases[] = "WHEN JSON_CONTAINS(categories, '\"{$value}\"') THEN {$index}";
        }

        return 'CASE ' . implode(' ', $cases) . ' ELSE ' . count(Post::CATEGORY_OPTIONS) . ' END';
    }

    private function normalizeCategories($input): array
    {
        if (is_null($input)) {
            return [];
        }

        if (!is_array($input)) {
            $input = explode(',', (string) $input);
        }

        return collect($input)
            ->map(fn ($value) => is_string($value) ? trim($value) : null)
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    public function store(Request $request)
    {
        $request->merge([
            'categories' => $this->normalizeCategories(
                $request->input('categories', $request->input('category'))
            ),
        ]);

        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
            'car_make' => 'required|string|max:255',
            'car_model' => 'required|string|max:255',
            'car_year' => 'required|integer|between:1900,2099',
            'categories' => ['required', 'array', 'min:1'],
            'categories.*' => ['string', Rule::in(Post::CATEGORY_OPTIONS)],
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'other' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $imagePaths = [];

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('images', 'public');
                $imagePaths[] = 'storage/' . $path;
            }
        }

        $car = Car::create([
            'make' => $request->car_make,
            'model' => $request->car_model,
            'year' => $request->car_year,
            'user_id' => Auth::id(),
        ]);

        $post = Post::create([
            'content' => $request->content,
            'user_id' => Auth::id(),
            'car_id' => $car->id,
            'images' => $imagePaths,
            'other' => $request->other,
            'categories' => $request->input('categories'),
        ]);

        return new PostResource($post);
    }

    /**
     * Display the specified post.
     */
    public function show(Request $request, $id)
    {
        $post = Post::with([
            'user',
            'car',
            'comments' => function ($query) {
                $query->orderBy('created_at');
            },
            'comments.user',
        ])
            ->withCount('likes')
            ->findOrFail($id);

        if ($request->user()) {
            $post->loadExists(['likedByUsers as liked_by_current_user' => function ($builder) use ($request) {
                $builder->where('user_id', $request->user()->id);
            }]);
        }

        return new PostResource($post);
    }

    /**
     * Update the specified post in storage.
     */
    public function update(Request $request, $id)
    {
        $incomingCategories = null;

        if ($request->has('categories') || $request->has('category')) {
            $incomingCategories = $this->normalizeCategories(
                $request->input('categories', $request->input('category'))
            );
            $request->merge(['categories' => $incomingCategories]);
        }

        $validator = Validator::make($request->all(), [
            'content' => 'sometimes|required|string',
            'car_make' => 'sometimes|required|string|max:255',
            'car_model' => 'sometimes|required|string|max:255',
            'car_year' => 'sometimes|required|integer|between:1900,2099',
            'categories' => ['sometimes', 'required', 'array', 'min:1'],
            'categories.*' => ['string', Rule::in(Post::CATEGORY_OPTIONS)],
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'other' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $post = Post::with('car')->findOrFail($id);

        if ($post->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $imagePaths = $post->images ?? [];

        if ($request->hasFile('images')) {
            $imagePaths = [];

            foreach ($request->file('images') as $image) {
                $path = $image->store('images', 'public');
                $imagePaths[] = 'storage/' . $path;
            }
        }

        $post->update([
            'content' => $request->input('content', $post->content),
            'images' => $imagePaths,
            'other' => $request->input('other', $post->other),
            'categories' => $incomingCategories ?? ($post->categories ?? []),
        ]);

        if ($post->car) {
            $post->car->update([
                'make' => $request->input('car_make', $post->car->make),
                'model' => $request->input('car_model', $post->car->model),
                'year' => $request->input('car_year', $post->car->year),
            ]);
        } elseif ($request->filled('car_make') && $request->filled('car_model') && $request->filled('car_year')) {
            $car = Car::create([
                'make' => $request->car_make,
                'model' => $request->car_model,
                'year' => $request->car_year,
                'user_id' => Auth::id(),
            ]);
            $post->update(['car_id' => $car->id]);
        }

        return new PostResource($post->fresh(['user', 'car']));
    }

    public function destroy($id)
    {
        $post = Post::findOrFail($id);

        // Prvo obrisi komentare vezane za post
        Comment::where('post_id', $post->id)->delete();

        // Onda obrisi post
        $post->delete();

        return response()->json(['message' => 'Post and related comments deleted successfully.']);
    }
}
