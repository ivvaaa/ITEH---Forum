<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->json('categories')->nullable()->after('content');
        });

        DB::table('posts')
            ->select(['id', 'category'])
            ->orderBy('id')
            ->chunkById(100, function ($posts) {
                foreach ($posts as $post) {
                    $value = $post->category;
                    $categories = [];

                    if (is_string($value) && trim($value) !== '') {
                        $categories[] = trim($value);
                    }

                    DB::table('posts')->where('id', $post->id)->update([
                        'categories' => $categories ? json_encode($categories) : null,
                    ]);
                }
            });

        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn('category');
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->string('category')->nullable()->after('content');
        });

        DB::table('posts')
            ->select(['id', 'categories'])
            ->orderBy('id')
            ->chunkById(100, function ($posts) {
                foreach ($posts as $post) {
                    $raw = $post->categories;
                    $category = null;

                    if (is_string($raw)) {
                        $decoded = json_decode($raw, true);
                        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded) && count($decoded) > 0) {
                            $category = (string) $decoded[0];
                        }
                    } elseif (is_array($raw) && count($raw) > 0) {
                        $category = (string) $raw[0];
                    }

                    DB::table('posts')->where('id', $post->id)->update([
                        'category' => $category,
                    ]);
                }
            });

        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn('categories');
        });
    }
};


