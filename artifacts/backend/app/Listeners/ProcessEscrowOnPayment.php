<?php

namespace App\Listeners;

use App\Events\PaymentCompleted;
use App\Models\Escrow;
use Illuminate\Contracts\Queue\ShouldQueue;

class ProcessEscrowOnPayment implements ShouldQueue
{
    public function handle(PaymentCompleted $event): void
    {
        $order = $event->order;
        $payment = $event->payment;

        Escrow::create([
            'order_id' => $order->id,
            'buyer_id' => $order->customer_id,
            'seller_id' => $order->items->first()?->vendor_id,
            'amount' => $payment->amount,
            'platform_fee' => 0,
            'vendor_amount' => $payment->amount,
            'status' => 'held',
        ]);
    }
}
