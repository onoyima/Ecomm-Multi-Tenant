<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partial_refunds', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('order_id');
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
            $table->uuid('customer_id');
            $table->foreign('customer_id')->references('id')->on('users')->onDelete('cascade');
            $table->decimal('amount', 15, 2);
            $table->string('reason');
            $table->string('status')->default('completed');
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('partial_refunds');
    }
};
