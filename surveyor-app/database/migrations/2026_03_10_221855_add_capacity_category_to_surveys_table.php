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
            $table->foreignId('capacity_category_id')->nullable()->after('capacity_limit')->constrained('capacity_categories')->nullOnDelete();
            $table->foreignId('pic_capacity_category_id')->nullable()->after('pic_capacity_limit')->constrained('capacity_categories')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('surveys', function (Blueprint $table) {
            $table->dropForeign(['capacity_category_id']);
            $table->dropForeign(['pic_capacity_category_id']);
            $table->dropColumn(['capacity_category_id', 'pic_capacity_category_id']);
        });
    }
};
