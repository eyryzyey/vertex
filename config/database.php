<?php
/**
 * Parses .env (if present) and exposes env_val().
 * On hosting like Vercel, real environment variables take priority,
 * so set DB_HOST / DB_NAME / DB_USER / DB_PASS in the dashboard.
 */
function load_env(): array
{
    static $env = null;
    if ($env !== null) {
        return $env;
    }
    $env = [];
    $file = dirname(__DIR__) . '/.env';
    if (is_file($file) && is_readable($file)) {
        foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $line = trim($line);
            if ($line === '' || strpos($line, '#') === 0 || strpos($line, '=') === false) {
                continue;
            }
            [$k, $v] = explode('=', $line, 2);
            $env[trim($k)] = trim($v);
        }
    }
    return $env;
}

function env_val(string $key, string $default = ''): string
{
    $val = getenv($key);
    if ($val !== false) {
        return $val;
    }
    $env = load_env();
    return $env[$key] ?? $default;
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=utf8mb4',
        env_val('DB_HOST', 'localhost'),
        env_val('DB_NAME', 'streaming_db')
    );
    $pdo = new PDO($dsn, env_val('DB_USER', 'root'), env_val('DB_PASS', ''), [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    return $pdo;
}
