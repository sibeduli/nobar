<?php

use App\Http\Controllers\Auth\PicAuthController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ==================== PIC Auth Routes (Guest) ====================
Route::middleware('guest:pic')->group(function () {
    Route::get('/login', [PicAuthController::class, 'showLogin'])->name('pic.login');
    Route::post('/login', [PicAuthController::class, 'login']);
    Route::get('/register', [PicAuthController::class, 'showRegister'])->name('pic.register');
    Route::post('/register', [PicAuthController::class, 'register']);
    Route::get('/forgot-password', function () {
        return Inertia::render('Auth/ForgotPassword');
    })->name('pic.forgot-password');
});

Route::get('/pending-approval', [PicAuthController::class, 'pendingApproval'])->name('pic.pending-approval');
Route::post('/pending-approval/check', [PicAuthController::class, 'checkStatus'])->name('pic.check-status');
Route::post('/pending-approval/logout', [PicAuthController::class, 'logoutPending'])->name('pic.logout-pending');

// ==================== PIC Protected Routes ====================
Route::middleware('auth:pic')->group(function () {
    Route::post('/logout', [PicAuthController::class, 'logout'])->name('pic.logout');
    
    Route::get('/', function () {
        return Inertia::render('Welcome');
    })->name('pic.dashboard');

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
});

// ==================== Agent Auth Routes (Guest) ====================
Route::middleware('guest:agent')->group(function () {
    Route::get('/agent/login', function () {
        return Inertia::render('Agent/Login');
    })->name('agent.login');
});

// ==================== Agent Protected Routes ====================
Route::middleware('auth:agent')->prefix('agent')->group(function () {
    Route::post('/logout', [App\Http\Controllers\Auth\AgentAuthController::class, 'logout'])->name('agent.logout');
    
    Route::get('/', function () {
        return Inertia::render('Agent/Dashboard');
    })->name('agent.dashboard');

    Route::get('/surveys', function () {
        return Inertia::render('Agent/Surveys/Index');
    });

    Route::get('/surveys/new', function () {
        return Inertia::render('Agent/Surveys/Create');
    });

    Route::get('/report', function () {
        return Inertia::render('Agent/Report/Index');
    });

    Route::get('/surveys/{id}', function ($id) {
        return Inertia::render('Agent/Surveys/Show', ['id' => $id]);
    });

    Route::get('/violations/report', function () {
        return Inertia::render('Agent/Violations/Report');
    });

    Route::get('/profile', function () {
        return Inertia::render('Agent/Profile');
    });
});
