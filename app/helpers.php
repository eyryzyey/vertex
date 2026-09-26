<?php
function e(?string $v): string
{
    return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8');
}

function redirect(string $url): void
{
    header("Location: $url");
    exit;
}

function flash(string $msg, string $type = 'success'): void
{
    $_SESSION['flash'] = ['msg' => $msg, 'type' => $type];
}

function get_flash(): ?array
{
    $f = $_SESSION['flash'] ?? null;
    unset($_SESSION['flash']);
    return $f;
}

/** Upload an image into public/uploads/{subdir} — returns relative path or null. */
function handle_upload(array $file, string $subdir, string $prefix): ?string
{
    if (empty($file['name']) || ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return null;
    }
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp'], true)) {
        return null;
    }
    if ($file['size'] > 5 * 1024 * 1024) {
        return null;
    }
    $dir = dirname(__DIR__) . '/public/uploads/' . $subdir;
    if (!is_dir($dir) && !mkdir($dir, 0755, true)) {
        return null;
    }
    $name = $prefix . '_' . time() . '_' . uniqid() . '.' . $ext;
    if (!@move_uploaded_file($file['tmp_name'], $dir . '/' . $name)) {
        return null; // e.g. read-only filesystem (Vercel) — caller keeps old value
    }
    return 'uploads/' . $subdir . '/' . $name;
}

/** Render a dashboard view wrapped in header + sidebar + footer. */
function view(string $path, array $data = []): void
{
    extract($data, EXTR_SKIP);
    include dirname(__DIR__) . '/views/layouts/header.php';
    include dirname(__DIR__) . '/views/layouts/sidebar.php';
    echo '<main class="page-content">';
    $f = get_flash();
    if ($f) {
        echo '<div class="alert alert-' . e($f['type']) . ' slideDown"><i class="fa-solid fa-circle-info"></i> ' . e($f['msg']) . '</div>';
    }
    include dirname(__DIR__) . '/views/' . $path . '.php';
    echo '</main>';
    include dirname(__DIR__) . '/views/layouts/footer.php';
}

/** Path helpers (public/ is the web root). */
function asset(string $path): string
{
    return $path;
}
function base_url(): string
{
    return 'index.php';
}
