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
        Schema::create('surveys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained()->onDelete('cascade');
            $table->string('merchant_id')->nullable(); // References Merchant.id from merchant app (cuid)
            $table->string('license_id')->nullable(); // References License.id from merchant app (cuid)
            
            // Report type
            $table->enum('category', ['commercial', 'non_commercial']);
            $table->string('report_type'); // approved, offering, violation_*, non_commercial_*
            
            // Venue info (for unlicensed venues or non-commercial)
            $table->string('venue_name')->nullable();
            $table->string('venue_address')->nullable();
            $table->string('venue_contact')->nullable();
            $table->string('venue_phone')->nullable();
            
            // Survey data
            $table->integer('actual_visitors')->nullable();
            $table->integer('capacity_limit')->nullable();
            $table->text('description')->nullable();
            $table->json('photos')->nullable(); // Array of photo URLs
            
            // Location
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            
            // Status
            $table->enum('status', ['pending', 'approved', 'rejected', 'needs_review'])->default('pending');
            $table->text('admin_notes')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->string('reviewed_by')->nullable();
            
            $table->timestamps();
            
            $table->index(['agent_id', 'status']);
            $table->index(['merchant_id']);
            $table->index(['report_type']);
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('surveys');
    }
};
