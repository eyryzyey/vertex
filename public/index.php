<?php
session_start();

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/app/helpers.php';
require_once dirname(__DIR__) . '/app/Models/Category.php';
require_once dirname(__DIR__) . '/app/Models/Channel.php';
require_once dirname(__DIR__) . '/app/Models/Movie.php';
require_once dirname(__DIR__) . '/app/Models/Anime.php';
require_once dirname(__DIR__) . '/app/Models/AdSetting.php';
require_once dirname(__DIR__) . '/app/Models/AppSetting.php';
require_once dirname(__DIR__) . '/app/Controllers/AuthController.php';
require_once dirname(__DIR__) . '/app/Controllers/DashboardController.php';
require_once dirname(__DIR__) . '/app/Controllers/CategoryController.php';
require_once dirname(__DIR__) . '/app/Controllers/ChannelController.php';
require_once dirname(__DIR__) . '/app/Controllers/MovieController.php';
require_once dirname(__DIR__) . '/app/Controllers/AnimeController.php';
require_once dirname(__DIR__) . '/app/Controllers/AdController.php';
require_once dirname(__DIR__) . '/app/Controllers/SettingsController.php';
require_once dirname(__DIR__) . '/app/Controllers/InstallController.php';

// 1. Installer gate
if (!InstallController::isInstalled()) {
    redirect('install.php');
}

// 2. Auth gate
$page = $_GET['page'] ?? 'dashboard';
if ($page === 'logout') {
    AuthController::logout();
}
if ($page === 'login') {
    AuthController::login();
    exit;
}
if (!AuthController::isLoggedIn()) {
    redirect('index.php?page=login');
}

// 3. Router
require dirname(__DIR__) . '/routes/web.php';
