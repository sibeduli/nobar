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

Route::get('/agents/activities', function () {
    return Inertia::render('Agents/Activities');
});

Route::get('/help', function () {
    return Inertia::render('Help');
});

Route::get('/surveys', function () {
    return Inertia::render('Surveys/Index');
});

Route::get('/venues/map', function () {
    return Inertia::render('Venues/Map');
});

Route::get('/pic/activities', function () {
    return Inertia::render('PIC/Activities');
});
