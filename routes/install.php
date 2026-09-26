<?php
/** Installer router — URL: install.php?step={1-4} (&ajax=1 for AJAX calls) */
if (InstallController::isInstalled()) {
    redirect('index.php');
}

if (!empty($_GET['ajax'])) {
    if (($_GET['ajax'] ?? '') === 'test-db') {
        InstallController::testDb();
    }
    if (($_GET['ajax'] ?? '') === 'install') {
        InstallController::run();
    }
}

$step = (int)($_GET['step'] ?? 1);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    switch ($step) {
        case 1:
            $_SESSION['install']['requirements'] = true;
            redirect('install.php?step=2');
            break;
        case 2:
            $_SESSION['install']['db'] = [
                'db_host' => trim($_POST['db_host'] ?? 'localhost'),
                'db_name' => trim($_POST['db_name'] ?? 'streaming_db'),
                'db_user' => trim($_POST['db_user'] ?? 'root'),
                'db_pass' => (string)($_POST['db_pass'] ?? ''),
            ];
            redirect('install.php?step=3');
            break;
        case 3:
            $_SESSION['install']['admin'] = [
                'admin_email' => trim($_POST['admin_email'] ?? ''),
                'admin_password' => (string)($_POST['admin_password'] ?? ''),
            ];
            redirect('install.php?step=4');
            break;
    }
}

$install = $_SESSION['install'] ?? [];
switch ($step) {
    case 2: include dirname(__DIR__) . '/views/install/step2_database.php'; break;
    case 3: include dirname(__DIR__) . '/views/install/step3_admin.php'; break;
    case 4: include dirname(__DIR__) . '/views/install/step4_finish.php'; break;
    default: include dirname(__DIR__) . '/views/install/step1_requirements.php'; break;
}
