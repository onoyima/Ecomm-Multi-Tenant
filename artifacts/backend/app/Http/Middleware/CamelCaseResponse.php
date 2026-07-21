<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CamelCaseResponse
{
    public function handle(Request $request, Closure $next): mixed
    {
        $response = $next($request);

        if ($response instanceof JsonResponse) {
            $data = $response->getData(true);
            $converted = $this->convertKeys($data);
            $response->setData($converted);
        }

        return $response;
    }

    private function convertKeys(mixed $data): mixed
    {
        if (is_array($data)) {
            $result = [];
            foreach ($data as $key => $value) {
                $camelKey = Str::camel($key);
                $result[$camelKey] = $this->convertKeys($value);
            }
            return $result;
        }

        if (is_object($data)) {
            $result = [];
            foreach (get_object_vars($data) as $key => $value) {
                $camelKey = Str::camel($key);
                $result[$camelKey] = $this->convertKeys($value);
            }
            return $result;
        }

        return $data;
    }
}
