<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayoutResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'vendor_id' => $this->vendor_id,
            'amount' => (float) $this->amount,
            'fee' => $this->fee ? (float) $this->fee : null,
            'reference' => $this->reference,
            'status' => $this->status,
            'bank_name' => $this->bank_name,
            'bank_account_name' => $this->bank_account_name,
            'bank_account_number' => $this->bank_account_number,
            'transaction_reference' => $this->transaction_reference,
            'notes' => $this->notes,
            'processed_at' => $this->processed_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'vendor' => new VendorResource($this->whenLoaded('vendor')),
        ];
    }
}
