<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class CreateRolesTable extends Migration
{
    public function up()
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id(); 
            $table->string('name');
            $table->timestamps();
        });

        // Insert default roles if they don't already exist
        $roles = ['admin', 'korisnik', 'guest'];
        
        foreach ($roles as $role) {
            DB::table('roles')->updateOrInsert(['name' => $role], ['name' => $role]);
        }
    }

    public function down()
    {
        // Optionally remove roles if rolling back
        DB::table('roles')->whereIn('name', ['admin', 'korisnik', 'guest'])->delete();
        
        Schema::dropIfExists('roles');
    }
}

