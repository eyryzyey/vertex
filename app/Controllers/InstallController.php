<?php
class InstallController
{
    public static function isInstalled(): bool
    {
        return strtolower(env_val('INSTALLED', 'false')) === 'true';
    }

    public static function requirements(): array
    {
        $root = dirname(__DIR__, 2);
        return [
            ['label' => 'PHP >= 7.4', 'ok' => version_compare(PHP_VERSION, '7.4.0', '>='), 'value' => PHP_VERSION],
            ['label' => 'PDO extension', 'ok' => extension_loaded('pdo'), 'value' => extension_loaded('pdo') ? 'enabled' : 'missing'],
            ['label' => 'PDO MySQL', 'ok' => extension_loaded('pdo_mysql'), 'value' => extension_loaded('pdo_mysql') ? 'enabled' : 'missing'],
            ['label' => 'mbstring', 'ok' => extension_loaded('mbstring'), 'value' => extension_loaded('mbstring') ? 'enabled' : 'missing'],
            ['label' => 'JSON', 'ok' => extension_loaded('json'), 'value' => extension_loaded('json') ? 'enabled' : 'missing'],
            ['label' => '.env writable', 'ok' => is_writable($root) || (file_exists($root . '/.env') && is_writable($root . '/.env')), 'value' => $root],
            ['label' => 'uploads/ writable', 'ok' => is_writable($root . '/public/uploads') || @mkdir($root . '/public/uploads/channels', 0755, true), 'value' => $root . '/public/uploads'],
        ];
    }

    public static function allRequirementsOk(): bool
    {
        foreach (self::requirements() as $r) {
            if (!$r['ok']) {
                return false;
            }
        }
        return true;
    }

    /** AJAX — test DB connection with posted credentials. */
    public static function testDb(): void
    {
        header('Content-Type: application/json');
        try {
            $pdo = new PDO(
                sprintf('mysql:host=%s;charset=utf8mb4', $_POST['db_host'] ?? 'localhost'),
                $_POST['db_user'] ?? 'root',
                $_POST['db_pass'] ?? '',
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
            echo json_encode(['status' => 'success', 'message' => 'Connection successful']);
        } catch (Throwable $t) {
            echo json_encode(['status' => 'error', 'message' => $t->getMessage()]);
        }
        exit;
    }

    /** AJAX — run the full installation. */
    public static function run(): void
    {
        header('Content-Type: application/json');
        try {
            $dbHost = $_POST['db_host'] ?? 'localhost';
            $dbName = $_POST['db_name'] ?? 'streaming_db';
            $dbUser = $_POST['db_user'] ?? 'root';
            $dbPass = $_POST['db_pass'] ?? '';
            $email = trim($_POST['admin_email'] ?? '');
            $password = $_POST['admin_password'] ?? '';

            if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 6) {
                throw new RuntimeException('Invalid admin email or password (min 6 chars).');
            }

            // 1. Connect + create database
            $pdo = new PDO("mysql:host=$dbHost;charset=utf8mb4", $dbUser, $dbPass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $pdo->exec("USE `$dbName`");

            // 2. Run schema (skip CREATE DATABASE / USE lines)
            $root = dirname(__DIR__, 2);
            $sql = file_get_contents($root . '/install.sql');
            foreach (preg_split('/;\s*(\r?\n|$)/', $sql) as $stmt) {
                $stmt = trim($stmt);
                if ($stmt === '' || stripos($stmt, 'CREATE DATABASE') === 0 || stripos($stmt, 'USE ') === 0) {
                    continue;
                }
                $pdo->exec($stmt);
            }

            // 3. Admin account
            $hash = password_hash($password, PASSWORD_BCRYPT);
            $pdo->prepare('INSERT INTO admins (email, password, role) VALUES (?, ?, ?)
                           ON DUPLICATE KEY UPDATE password = VALUES(password), role = ?')
                ->execute([$email, $hash, 'super_admin', $hash, 'super_admin']);

            // 4. Write .env (local hosting). On Vercel you instead set env vars
            //    in the dashboard and skip this file.
            $env = "DB_HOST=$dbHost
DB_NAME=$dbName
DB_USER=$dbUser
DB_PASS=$dbPass
"
                 . "APP_NAME=" . ($_POST['app_name'] ?? 'StreamVault') . "
APP_URL=
"
                 . "MAINTENANCE_MODE=false
INSTALLED=true
";
            if (is_writable($root) || (file_exists($root . '/.env') && is_writable($root . '/.env'))) {
                @file_put_contents($root . '/.env', $env);
            }

            echo json_encode(['status' => 'success', 'message' => 'Installation completed']);
        } catch (Throwable $t) {
            echo json_encode(['status' => 'error', 'message' => $t->getMessage()]);
        }
        exit;
    }
}
