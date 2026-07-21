<?php

namespace App\Events;

use App\Models\Product;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProductImported
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Product $product;
    public string $source;

    public function __construct(Product $product, string $source)
    {
        $this->product = $product;
        $this->source = $source;
    }
}
