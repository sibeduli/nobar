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
        Schema::create('survey_bills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('survey_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('bill_number')->unique();
            
            // Snapshot pricing at time of sending
            $table->decimal('base_price', 15, 2);
            $table->decimal('markup', 15, 2)->default(10000000);
            $table->decimal('amount', 15, 2);
            $table->decimal('pic_commission', 15, 2);
            
            // Status: sent -> paid
            $table->enum('status', ['sent', 'paid', 'cancelled'])->default('sent');
            $table->timestamp('sent_at')->nullable();
            $table->date('due_date')->nullable();
            $table->timestamp('paid_at')->nullable();
            
            // Merchant snapshot
            $table->string('merchant_name')->nullable();
            $table->string('merchant_address')->nullable();
            $table->string('merchant_phone')->nullable();
            
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('pics')->nullOnDelete();
            $table->timestamps();
        });

        // Add is_locked to surveys
        Schema::table('surveys', function (Blueprint $table) {
            $table->boolean('is_locked')->default(false)->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('surveys', function (Blueprint $table) {
            $table->dropColumn('is_locked');
        });
        Schema::dropIfExists('survey_bills');
    }
};
