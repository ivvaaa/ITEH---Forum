<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('interests')->nullable()->after('email'); // Interesovanja kao tekstualno polje
            $table->string('profile_photo')->nullable()->after('interests'); // Putanja do profilne slike
            $table->text('bio')->nullable()->after('profile_photo'); // Kratka biografija korisnika
            $table->unsignedInteger('posts_count')->default(0)->after('bio'); // Broj postova, default je 0
            $table->date('birth')->nullable()->after('posts_count'); // Datum rođenja
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['interests', 'profile_photo', 'bio', 'posts_count', 'birth']);
        });
    }
};
