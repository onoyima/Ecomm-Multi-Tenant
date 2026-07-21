<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InitiateGuestCheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'shipping_address' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|string|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'required|string|in:paystack,wallet,pod',
            'guest_name' => 'nullable|string|max:255',
            'guest_email' => 'nullable|email|max:255',
            'guest_phone' => 'nullable|string|max:50',
        ];
    }

    public function messages(): array
    {
        return [
            'shipping_address.required' => 'Shipping address is required',
            'items.required' => 'Order must contain at least one item',
            'items.*.product_id.required' => 'Each item must have a product ID',
            'items.*.product_id.exists' => 'Invalid product selected',
            'items.*.quantity.required' => 'Each item must have a quantity',
            'items.*.quantity.min' => 'Quantity must be at least 1',
            'payment_method.required' => 'Payment method is required',
            'payment_method.in' => 'Payment method must be paystack, wallet, or pod',
        ];
    }
}
