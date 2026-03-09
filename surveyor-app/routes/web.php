<?php

use App\Http\Controllers\AgentController;
use App\Http\Controllers\Auth\PicAuthController;
use App\Http\Controllers\CompanyProfileController;
use App\Http\Controllers\RegionController;
use App\Http\Controllers\SettingsController;
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

// ==================== Region API Routes ====================
Route::get('/api/provinces', [RegionController::class, 'provinces']);
Route::get('/api/cities/{provinceId}', [RegionController::class, 'cities']);
Route::get('/api/districts/{cityId}', [RegionController::class, 'districts']);

// ==================== PIC Protected Routes ====================
Route::middleware('auth:pic')->group(function () {
    Route::post('/logout', [PicAuthController::class, 'logout'])->name('pic.logout');
    
    Route::get('/', function () {
        return Inertia::render('Welcome');
    })->name('pic.dashboard');

    Route::get('/company-profile', [CompanyProfileController::class, 'show'])->name('pic.company-profile');
    Route::put('/company-profile', [CompanyProfileController::class, 'update'])->name('pic.company-profile.update');

    Route::get('/agents', [AgentController::class, 'index'])->name('pic.agents.index');
    Route::get('/agents/create', [AgentController::class, 'create'])->name('pic.agents.create');
    Route::get('/agents/activities', function () {
        return Inertia::render('Agents/Activities');
    });
    Route::get('/agents/export', [AgentController::class, 'export'])->name('pic.agents.export');
    Route::post('/agents/bulk-status', [AgentController::class, 'bulkUpdateStatus'])->name('pic.agents.bulk-status');
    Route::post('/agents/bulk-delete', [AgentController::class, 'bulkDelete'])->name('pic.agents.bulk-delete');
    Route::post('/agents', [AgentController::class, 'store'])->name('pic.agents.store');
    Route::get('/agents/{agent}', [AgentController::class, 'show'])->name('pic.agents.show');
    Route::get('/agents/{agent}/edit', [AgentController::class, 'edit'])->name('pic.agents.edit');
    Route::put('/agents/{agent}', [AgentController::class, 'update'])->name('pic.agents.update');
    Route::delete('/agents/{agent}', [AgentController::class, 'destroy'])->name('pic.agents.destroy');
    Route::put('/agents/{agent}/reset-password', [AgentController::class, 'resetPassword'])->name('pic.agents.reset-password');
    Route::post('/agents/{agent}/force-logout', [AgentController::class, 'forceLogout'])->name('pic.agents.force-logout');

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

    Route::get('/settings', [SettingsController::class, 'index'])->name('pic.settings');
    Route::put('/settings/profile', [SettingsController::class, 'updateProfile'])->name('pic.settings.profile');
    Route::put('/settings/password', [SettingsController::class, 'updatePassword'])->name('pic.settings.password');
    Route::delete('/settings/sessions/{sessionId}', [SettingsController::class, 'revokeSession'])->name('pic.settings.revoke-session');
    Route::delete('/settings/sessions', [SettingsController::class, 'revokeAllSessions'])->name('pic.settings.revoke-all-sessions');
});

// ==================== Agent Auth Routes (Guest) ====================
Route::middleware('guest:agent')->group(function () {
    Route::get('/agent/login', [App\Http\Controllers\Auth\AgentAuthController::class, 'showLogin'])->name('agent.login');
    Route::post('/agent/login', [App\Http\Controllers\Auth\AgentAuthController::class, 'login']);
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
