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
    public function up(): void
    {
        Schema::create('capacity_categories', function (Blueprint $table) {
            $table->id();
            $table->string('code'); // CAT1, CAT2, etc.
            $table->string('label'); // 0-50, 50-100, etc.
            $table->integer('min_capacity');
            $table->integer('max_capacity')->nullable(); // null for 1000-above
            $table->decimal('price', 15, 2); // Price in Rupiah
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Seed the capacity categories
        DB::table('capacity_categories')->insert([
            ['code' => 'CAT1', 'label' => '0-50', 'min_capacity' => 0, 'max_capacity' => 50, 'price' => 5000000, 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'CAT2', 'label' => '50-100', 'min_capacity' => 50, 'max_capacity' => 100, 'price' => 7500000, 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'CAT3', 'label' => '100-200', 'min_capacity' => 100, 'max_capacity' => 200, 'price' => 10000000, 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'CAT4', 'label' => '200-300', 'min_capacity' => 200, 'max_capacity' => 300, 'price' => 15000000, 'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'CAT5', 'label' => '300-400', 'min_capacity' => 300, 'max_capacity' => 400, 'price' => 20000000, 'sort_order' => 5, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'CAT6', 'label' => '400-500', 'min_capacity' => 400, 'max_capacity' => 500, 'price' => 25000000, 'sort_order' => 6, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'CAT7', 'label' => '500-1000', 'min_capacity' => 500, 'max_capacity' => 1000, 'price' => 30000000, 'sort_order' => 7, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'CAT8', 'label' => '1000-above', 'min_capacity' => 1000, 'max_capacity' => null, 'price' => 35000000, 'sort_order' => 8, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('capacity_categories');
    }
};
