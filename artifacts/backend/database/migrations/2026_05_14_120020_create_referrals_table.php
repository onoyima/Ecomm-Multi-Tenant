<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('referrals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('referrer_id');
            $table->uuid('referred_id')->nullable();
            $table->string('referral_code', 20)->unique();
            $table->enum('status', ['pending', 'completed', 'expired'])->default('pending');
            $table->decimal('reward_amount', 12, 2)->default(0);
            $table->string('reward_currency', 3)->default('NGN');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('referrer_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('referred_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referrals');
    }
};
