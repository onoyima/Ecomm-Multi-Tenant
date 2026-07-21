<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Cors
{
    public function handle(Request $request, Closure $next): Response
    {
        $origin = $request->header('Origin', '*');
        $allowedOrigins = config('cors.allowed_origins', ['*']);

        if (in_array('*', $allowedOrigins)) {
            $allowedOrigin = '*';
        } elseif (in_array($origin, $allowedOrigins)) {
            $allowedOrigin = $origin;
        } else {
            $allowedOrigin = $allowedOrigins[0] ?? '*';
        }

        $headers = [
            'Access-Control-Allow-Origin' => $allowedOrigin,
            'Access-Control-Allow-Methods' => implode(', ', config('cors.allowed_methods')),
            'Access-Control-Allow-Headers' => implode(', ', config('cors.allowed_headers')),
            'Access-Control-Allow-Credentials' => 'true',
            'Access-Control-Max-Age' => (string) config('cors.max_age', 86400),
        ];

        if ($request->isMethod('OPTIONS')) {
            return response('', 204)->withHeaders($headers);
        }

        $response = $next($request);
        foreach ($headers as $key => $value) {
            $response->headers->set($key, $value);
        }

        return $response;
    }
}
