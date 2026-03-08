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
        Schema::create('agents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('phone')->unique();
            $table->string('email')->nullable();
            $table->string('password');
            $table->string('nik')->nullable();
            $table->string('address')->nullable();
            $table->json('areas')->nullable(); // Array of assigned areas
            $table->string('qr_code')->unique(); // Agent QR code for merchant verification
            $table->enum('status', ['active', 'inactive', 'pending'])->default('active');
            $table->timestamp('last_login_at')->nullable();
            $table->timestamps();
            
            $table->index(['company_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agents');
    }
};
