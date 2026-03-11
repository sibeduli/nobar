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
        Schema::table('survey_bills', function (Blueprint $table) {
            $table->decimal('ppn', 15, 2)->default(0)->after('amount');
            $table->decimal('nett', 15, 2)->default(0)->after('ppn');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('survey_bills', function (Blueprint $table) {
            $table->dropColumn(['ppn', 'nett']);
        });
    }
};
