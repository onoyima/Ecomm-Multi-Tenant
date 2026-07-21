<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fraud_alerts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('transaction_id')->nullable();
            $table->uuid('order_id')->nullable();
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('set null');
            $table->uuid('user_id')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->decimal('amount', 12, 2);
            $table->integer('risk_score')->default(0);
            $table->string('risk_level')->default('low');
            $table->string('reason')->nullable();
            $table->text('description')->nullable();
            $table->string('customer_name')->nullable();
            $table->string('status')->default('flagged');
            $table->string('action_taken')->nullable();
            $table->uuid('actioned_by')->nullable();
            $table->foreign('actioned_by')->references('id')->on('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fraud_alerts');
    }
};
