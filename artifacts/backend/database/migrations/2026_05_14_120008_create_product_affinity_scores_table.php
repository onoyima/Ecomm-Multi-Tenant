<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_affinity_scores', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('source_product_id');
            $table->foreign('source_product_id')->references('id')->on('products')->onDelete('cascade');
            $table->uuid('target_product_id');
            $table->foreign('target_product_id')->references('id')->on('products')->onDelete('cascade');
            $table->decimal('score', 8, 4)->default(0);
            $table->string('type');
            $table->timestamps();
            $table->unique(['source_product_id', 'target_product_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_affinity_scores');
    }
};
