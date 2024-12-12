<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB; 

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
     { Schema::create('roles', function (Blueprint $table) { 
        $table->id(); 
        $table->string('name'); 
        $table->timestamps(); }); // Insert default roles 
    DB::table('roles')->insert([ ['name' => 'admin'], ['name' => 'registered'], ['name' => 'not registered'] ]); }
    

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
