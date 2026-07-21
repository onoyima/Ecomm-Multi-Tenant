<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_images', function (Blueprint $table) {
            $table->string('source_type')->default('upload')->after('url')->comment('upload or url');
            $table->string('disk')->default('public')->after('source_type')->comment('cloud storage disk name');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->string('image_source_type')->default('upload')->after('images')->comment('upload or url');
        });
    }

    public function down(): void
    {
        Schema::table('product_images', function (Blueprint $table) {
            $table->dropColumn(['source_type', 'disk']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('image_source_type');
        });
    }
};
