<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class TopUpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => 'required|numeric|min:100',
            'payment_method' => 'nullable|string|max:50',
        ];
    }
}
