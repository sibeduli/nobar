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
        Schema::create('pic_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pic_id')->constrained('pics')->onDelete('cascade');
            $table->string('type'); // login, logout, approve_survey, reject_survey, edit_survey, create_agent, edit_agent, delete_agent, export_data
            $table->string('description')->nullable();
            $table->string('target_type')->nullable(); // Survey, Agent, etc.
            $table->unsignedBigInteger('target_id')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pic_activity_logs');
    }
};
