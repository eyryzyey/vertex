<?php
$nav = [
    ['dashboard', 'fa-gauge-high', 'Dashboard'],
    ['__CONTENT__', '', 'Content'],
    ['categories', 'fa-layer-group', 'Categories'],
    ['channels', 'fa-tv', 'Channels'],
    ['movies', 'fa-film', 'Movies'],
    ['anime', 'fa-dragon', 'Anime'],
    ['__MONETIZE__', '', 'Monetization'],
    ['ads', 'fa-rectangle-ad', 'Ad Networks'],
    ['__SYSTEM__', '', 'System'],
    ['settings', 'fa-gear', 'Settings'],
];
$appName = AppSetting::get('app_name', 'StreamVault');
?>
<aside class="sidebar" id="sidebar">
    <div class="sidebar-brand"><i class="fa-solid fa-clapperboard"></i> <?= e($appName) ?></div>
    <nav class="sidebar-nav">
        <?php foreach ($nav as [$p, $icon, $label]):
            if (str_starts_with($p, '__')): ?>
                <div class="nav-section"><?= e($label) ?></div>
            <?php else: ?>
                <a href="index.php?page=<?= e($p) ?>" class="<?= $page === $p ? 'active' : '' ?>">
                    <i class="fa-solid <?= e($icon) ?>"></i> <?= e($label) ?>
                </a>
            <?php endif;
        endforeach; ?>
    </nav>
    <div class="sidebar-footer">v<?= e(AppSetting::get('app_version', '1.0.0')) ?> &middot; Admin Panel</div>
</aside>

<div class="main-area">
    <header class="topbar">
        <button class="icon-btn menu-toggle" id="menuToggle" aria-label="Menu"><i class="fa-solid fa-bars"></i></button>
        <div class="search-box">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="globalSearch" placeholder="Search in this page...">
        </div>
        <div class="spacer"></div>
        <button class="icon-btn" title="Notifications"><i class="fa-regular fa-bell"></i><span class="dot"></span></button>
        <button class="icon-btn" id="fullscreenBtn" title="Fullscreen"><i class="fa-solid fa-expand"></i></button>
        <div class="admin-chip">
            <div class="info"><b><?= e($_SESSION['admin_email'] ?? 'Admin') ?></b><span><?= e($_SESSION['admin_role'] ?? 'admin') ?></span></div>
            <div class="avatar"><i class="fa-solid fa-user-shield"></i></div>
        </div>
        <a href="index.php?page=logout" class="icon-btn" title="Logout"><i class="fa-solid fa-right-from-bracket"></i></a>
    </header>
