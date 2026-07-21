<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'original_price' => 'nullable|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'category' => 'sometimes|string|max:255',
            'images' => 'nullable|array',
            'images.*' => 'string',
            'image_files' => 'nullable|array',
            'image_files.*' => 'file|mimes:jpg,jpeg,png,gif,webp|max:10240',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'is_dropshipping' => 'nullable|boolean',
            'supplier_url' => 'nullable|string|url',
            'supplier_price' => 'nullable|numeric|min:0',
            'markup_percent' => 'nullable|integer|min:0|max:1000',
            'free_shipping' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'variants' => 'nullable|array',
        ];
    }
}
