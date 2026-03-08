<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class RegionController extends Controller
{
    private const API_BASE = 'https://www.emsifa.com/api-wilayah-indonesia/api';

    public function provinces()
    {
        $data = Cache::remember('provinces', 86400, function () {
            $response = Http::get(self::API_BASE . '/provinces.json');
            return $response->json();
        });

        return response()->json($data);
    }

    public function cities($provinceId)
    {
        $data = Cache::remember("cities_{$provinceId}", 86400, function () use ($provinceId) {
            $response = Http::get(self::API_BASE . "/regencies/{$provinceId}.json");
            return $response->json();
        });

        return response()->json($data);
    }

    public function districts($cityId)
    {
        $data = Cache::remember("districts_{$cityId}", 86400, function () use ($cityId) {
            $response = Http::get(self::API_BASE . "/districts/{$cityId}.json");
            return $response->json();
        });

        return response()->json($data);
    }
}
