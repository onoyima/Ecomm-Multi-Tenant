<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'phone' => $this->phone,
            'avatar' => $this->avatar,
            'wallet_balance' => $this->wallet_balance,
            'kyc_status' => $this->kyc_status,
            'business_name' => $this->vendor?->shop_name,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
        ];
    }
}
