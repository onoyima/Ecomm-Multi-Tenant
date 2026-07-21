<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;

class TenantMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $vendorId = null;
        if ($request->user() && $request->user()->vendor_id) {
            $vendorId = $request->user()->vendor_id;
        }
        if ($request->header('X-Vendor-ID')) {
            $vendorId = $request->header('X-Vendor-ID');
        }
        Config::set('app.current_vendor_id', $vendorId);
        return $next($request);
    }
}
