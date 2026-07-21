<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('seo_meta', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('metaable_type'); // e.g. 'product', 'category', 'page'
            $table->string('metaable_id');
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->text('keywords')->nullable();
            $table->string('canonical_url')->nullable();
            $table->string('og_image')->nullable();
            $table->timestamps();
            $table->index(['metaable_type', 'metaable_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('seo_meta'); }
};
