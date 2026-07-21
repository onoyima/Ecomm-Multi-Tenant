<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Cashback;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class CashbackController extends Controller {
    use FlattensPagination;
    public function index(): JsonResponse {
        $cashbacks = Cashback::where('user_id', auth()->id())->latest()->paginate(20);
        return $this->paginatedResponse($cashbacks, 'Cashbacks retrieved');
    }
    public function balance(): JsonResponse {
        $balance = Cashback::where('user_id', auth()->id())->where('status', 'credited')->where(function ($q) { $q->whereNull('expires_at')->orWhere('expires_at', '>', now()); })->sum('amount');
        return response()->json(['success' => true, 'data' => ['balance' => $balance]]);
    }
}
