<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class CreateDisputeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_id' => 'required|exists:orders,id',
            'subject' => 'required|string|max:255',
            'description' => 'required|string|min:10',
        ];
    }
}
