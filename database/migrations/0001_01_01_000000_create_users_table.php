<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * ovde je stvaranje vise migracija u jednoj 
     */
    public function up(): void
    {
        // Tabela 'users'
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->foreignId('role_id') // Dodavanje role_id kolone
                  ->constrained('roles') // Povezivanje sa tabelom 'roles'
                  ->onDelete('cascade'); // Ako se role obriše, brišu se i korisnici sa tom ulogom
            $table->timestamps();
        });

        // Kreiranje tabele 'password_reset_tokens'
        if (!Schema::hasTable('password_reset_tokens')) {
            Schema::create('password_reset_tokens', function (Blueprint $table) {
                $table->string('email')->primary();
                $table->string('token');
                $table->timestamp('created_at')->nullable();
            });
        }

        // Kreiranje tabele 'sessions'
        if (!Schema::hasTable('sessions')) {
            Schema::create('sessions', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->foreignId('user_id')->nullable()->index();
                $table->string('ip_address', 45)->nullable();
                $table->text('user_agent')->nullable();
                $table->longText('payload');
                $table->integer('last_activity')->index();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Ukloni strane ključeve (ako postoje) pre nego što brišeš tabele
        Schema::table('comments', function (Blueprint $table) {
            $table->dropForeign(['user_id']); // Pretpostavljam da je 'user_id' strani ključ u 'comments' tabeli
        });

        Schema::table('sessions', function (Blueprint $table) {
            $table->dropForeign(['user_id']); // Isto za 'sessions' tabelu
        });

        // Na kraju obriši tabele
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
        Schema::dropIfExists('comments');
    }
};
