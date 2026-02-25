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

Route::get('/settings', function () {
    return Inertia::render('Settings/Index');
});

Route::get('/login', function () {
    return Inertia::render('Auth/Login');
});

Route::get('/register', function () {
    return Inertia::render('Auth/Register');
});

Route::get('/forgot-password', function () {
    return Inertia::render('Auth/ForgotPassword');
});

Route::get('/pending-approval', function () {
    return Inertia::render('Auth/PendingApproval');
});

// Agent Routes
Route::get('/agent/login', function () {
    return Inertia::render('Agent/Login');
});

Route::get('/agent', function () {
    return Inertia::render('Agent/Dashboard');
});

Route::get('/agent/surveys', function () {
    return Inertia::render('Agent/Surveys/Index');
});

Route::get('/agent/surveys/new', function () {
    return Inertia::render('Agent/Surveys/Create');
});

Route::get('/agent/report', function () {
    return Inertia::render('Agent/Report/Index');
});

Route::get('/agent/surveys/{id}', function ($id) {
    return Inertia::render('Agent/Surveys/Show', ['id' => $id]);
});

Route::get('/agent/violations/report', function () {
    return Inertia::render('Agent/Violations/Report');
});

Route::get('/agent/profile', function () {
    return Inertia::render('Agent/Profile');
});
