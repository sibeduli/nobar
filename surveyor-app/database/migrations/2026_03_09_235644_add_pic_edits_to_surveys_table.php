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
            // PIC edits - overrides agent data when set
            $table->string('pic_venue_contact')->nullable()->after('venue_phone');
            $table->string('pic_venue_phone')->nullable()->after('pic_venue_contact');
            $table->string('pic_category')->nullable()->after('pic_venue_phone'); // commercial/non_commercial
            $table->integer('pic_capacity_limit')->nullable()->after('pic_category');
            $table->text('pic_description')->nullable()->after('pic_capacity_limit');
            $table->foreignId('pic_edited_by')->nullable()->after('pic_description')->constrained('users')->nullOnDelete();
            $table->timestamp('pic_edited_at')->nullable()->after('pic_edited_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('surveys', function (Blueprint $table) {
            $table->dropForeign(['pic_edited_by']);
            $table->dropColumn([
                'pic_venue_contact',
                'pic_venue_phone',
                'pic_category',
                'pic_capacity_limit',
                'pic_description',
                'pic_edited_by',
                'pic_edited_at',
            ]);
        });
    }
};
