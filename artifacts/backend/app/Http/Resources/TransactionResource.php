<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'wallet_id' => $this->wallet_id,
            'type' => $this->type,
            'amount' => (float) $this->amount,
            'description' => $this->description,
            'reference' => $this->reference,
            'balance_before' => $this->balance_before ? (float) $this->balance_before : null,
            'balance_after' => $this->balance_after ? (float) $this->balance_after : null,
            'metadata' => $this->metadata,
            'status' => $this->status ?? 'completed',
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
