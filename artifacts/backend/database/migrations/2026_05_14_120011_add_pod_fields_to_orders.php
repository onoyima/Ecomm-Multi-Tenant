<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('pod_fee', 12, 2)->default(0)->after('shipping_fee');
            $table->string('pod_status')->nullable()->after('payment_status');
            $table->timestamp('pod_delivery_confirmed_at')->nullable()->after('estimated_delivery');
            $table->text('pod_delivery_notes')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['pod_fee', 'pod_status', 'pod_delivery_confirmed_at', 'pod_delivery_notes']);
        });
    }
};
