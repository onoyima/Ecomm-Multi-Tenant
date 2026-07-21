<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('cashbacks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('order_id')->nullable();
            $table->decimal('amount', 12, 2);
            $table->string('type'); // 'order_cashback', 'signup_bonus', 'promotion'
            $table->string('status')->default('pending'); // pending, credited, expired
            $table->timestamp('credited_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('set null');
        });
    }
    public function down(): void { Schema::dropIfExists('cashbacks'); }
};
