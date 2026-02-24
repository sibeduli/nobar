<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
});

Route::get('/company-profile', function () {
    return Inertia::render('CompanyProfile');
});

Route::get('/agents', function () {
    return Inertia::render('Agents/Index');
});

Route::get('/agents/create', function () {
    return Inertia::render('Agents/Create');
});
