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
        Schema::table('surveys', function (Blueprint $table) {
            // Drop the incorrect foreign key to users table
            $table->dropForeign(['pic_edited_by']);
            
            // Add correct foreign key to pics table
            $table->foreign('pic_edited_by')->references('id')->on('pics')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('surveys', function (Blueprint $table) {
            $table->dropForeign(['pic_edited_by']);
            $table->foreign('pic_edited_by')->references('id')->on('users')->nullOnDelete();
        });
    }
};
