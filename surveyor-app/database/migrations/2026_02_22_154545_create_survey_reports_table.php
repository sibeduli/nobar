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
        Schema::create('survey_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('surveyor_id')->constrained()->cascadeOnDelete();
            $table->string('license_id');
            $table->enum('status', ['compliant', 'violation', 'pending'])->default('pending');
            $table->text('notes')->nullable();
            $table->json('photos')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->timestamp('inspected_at')->nullable();
            $table->timestamps();

            $table->unique(['license_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('survey_reports');
    }
};
