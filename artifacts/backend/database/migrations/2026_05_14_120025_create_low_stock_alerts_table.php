<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('low_stock_alerts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('product_id');
            $table->uuid('vendor_id');
            $table->integer('current_stock');
            $table->integer('threshold')->default(10);
            $table->boolean('notified')->default(false);
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('vendor_id')->references('id')->on('vendors')->onDelete('cascade');
        });
    }
    public function down(): void { Schema::dropIfExists('low_stock_alerts'); }
};
