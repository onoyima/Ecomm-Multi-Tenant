<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dropship_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('vendor_id');
            $table->foreign('vendor_id')->references('id')->on('vendors')->onDelete('cascade');
            $table->string('source_url');
            $table->string('title')->nullable();
            $table->decimal('supplier_price', 12, 2)->default(0);
            $table->decimal('selling_price', 12, 2)->default(0);
            $table->integer('markup_percent')->default(30);
            $table->string('category')->nullable();
            $table->json('images')->nullable();
            $table->json('ai_processed_data')->nullable();
            $table->string('status')->default('pending');
            $table->string('supplier_name')->nullable();
            $table->string('estimated_delivery')->nullable();
            $table->integer('ai_score')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dropship_requests');
    }
};
