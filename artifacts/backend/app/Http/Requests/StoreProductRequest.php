<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'original_price' => 'nullable|numeric|min:0|gte:price',
            'cost_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category' => 'required|string|max:255',
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
            'variants' => 'nullable|array',
            'variants.*.label' => 'required_with:variants|string',
            'variants.*.options' => 'required_with:variants|array',
            'variants.*.options.*' => 'string',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Product title is required',
            'price.required' => 'Product price is required',
            'stock.required' => 'Stock quantity is required',
            'category.required' => 'Product category is required',
            'variants.*.label.required_with' => 'Each variant must have a label',
            'variants.*.options.required_with' => 'Each variant must have options',
        ];
    }
}
