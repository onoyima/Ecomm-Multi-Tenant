<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class BulkProductImportController extends Controller {
    public function store(Request $req): JsonResponse {
        $req->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240',
            'vendor_id' => 'required|exists:vendors,id',
        ]);
        $vendor = Vendor::findOrFail($req->vendor_id);
        $path = $req->file('file')->getRealPath();
        $handle = fopen($path, 'r');
        $header = fgetcsv($handle);
        $created = 0;
        $errors = [];
        $row = 1;
        while (($line = fgetcsv($handle)) !== false) {
            $row++;
            $data = array_combine($header, $line);
            try {
                Product::create([
                    'vendor_id' => $vendor->id,
                    'name' => $data['name'] ?? '',
                    'description' => $data['description'] ?? '',
                    'price' => $data['price'] ?? 0,
                    'stock' => $data['stock'] ?? 0,
                    'sku' => $data['sku'] ?? null,
                    'is_active' => filter_var($data['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN),
                ]);
                $created++;
            } catch (\Exception $e) {
                $errors[] = "Row {$row}: {$e->getMessage()}";
            }
        }
        fclose($handle);
        return response()->json(['success' => true, 'message' => "Imported {$created} products", 'data' => ['created' => $created, 'errors' => $errors]]);
    }
}
