<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|string',
            'items.*.title' => 'required|string|max:255',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.image' => 'nullable|string',
            'shipping_address' => 'required|string',
            'payment_method' => 'required|string|in:paystack,wallet,pod',
            'total' => 'required|numeric|min:0',
            'shipping_fee' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'Order must contain at least one item',
            'items.*.product_id.required' => 'Each item must have a product ID',
            'shipping_address.required' => 'Shipping address is required',
            'payment_method.required' => 'Payment method is required',
            'payment_method.in' => 'Payment method must be paystack, wallet, or pod',
            'total.required' => 'Order total is required',
        ];
    }
}
