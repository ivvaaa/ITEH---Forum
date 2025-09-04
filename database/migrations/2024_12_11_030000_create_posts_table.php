<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();

            // author
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // optional relation to car (delete this column if you don't want it)
            $table->foreignId('car_id')->nullable()->constrained()->cascadeOnDelete();

            // content + extras
            $table->text('content');
            $table->json('images')->nullable(); // store array of image URLs
            $table->string('other')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};

