<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendors', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->string('shop_name');
            $table->text('shop_description')->nullable();
            $table->string('shop_logo')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('account_name')->nullable();
            $table->string('status')->default('pending');
            $table->decimal('commission_rate', 5, 2)->default(10.00);
            $table->decimal('total_revenue', 12, 2)->default(0);
            $table->integer('total_orders')->default(0);
            $table->integer('total_products')->default(0);
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('fraud_score')->default(0);
            $table->string('verification_status')->default('pending');
            $table->json('documents')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendors');
    }
};
