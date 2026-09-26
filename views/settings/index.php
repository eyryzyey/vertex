<?php
$val = fn($k) => e($settings[$k] ?? '');
$on = fn($k) => ($settings[$k] ?? '0') === '1' ? 'checked' : '';
$toggles = [
    'maintenance_mode' => ['Maintenance Mode', 'Temporarily disable the app for all users'],
    'force_update' => ['Force Update', 'Require users to update before using the app'],
    'show_ads' => ['Show Ads', 'Enable advertising in the app'],
    'enable_channels' => ['Enable Channels', 'Show the channels section in the app'],
    'enable_movies' => ['Enable Movies', 'Show the movies section in the app'],
    'enable_anime' => ['Enable Anime', 'Show the anime section in the app'],
    'update_enabled' => ['Update Notifications', 'Notify users when a new version is available'],
];
?>
<div class="page-header">
    <div>
        <h1>Settings</h1>
        <div class="breadcrumb"><a href="index.php?page=dashboard">Home</a> / Settings</div>
    </div>
</div>

<form method="POST" action="index.php?page=settings&action=save">
    <div class="grid-2">
        <div class="card card-pad">
            <div class="card-title"><i class="fa-solid fa-sliders"></i> General Settings</div>
            <div class="form-group mb-2">
                <label class="form-label">App Name</label>
                <input type="text" name="app_name" class="form-control" value="<?= $val('app_name') ?>">
            </div>
            <div class="form-group mb-2">
                <label class="form-label">App Version</label>
                <input type="text" name="app_version" class="form-control" value="<?= $val('app_version') ?>" placeholder="1.0.0">
            </div>
            <div class="form-group mb-2">
                <label class="form-label">Description</label>
                <textarea name="app_description" class="form-control"><?= $val('app_description') ?></textarea>
            </div>
            <div class="form-group mb-2">
                <label class="form-label">Support Email</label>
                <input type="text" name="support_email" class="form-control" value="<?= $val('support_email') ?>" placeholder="support@example.com">
            </div>
            <div class="form-group mb-2">
                <label class="form-label">Privacy Policy URL</label>
                <input type="text" name="privacy_url" class="form-control" value="<?= $val('privacy_url') ?>">
            </div>
            <div class="form-group mb-2">
                <label class="form-label">Terms of Service</label>
                <textarea name="terms_of_service" class="form-control"><?= $val('terms_of_service') ?></textarea>
            </div>
        </div>

        <div>
            <div class="card card-pad mb-2">
                <div class="card-title"><i class="fa-solid fa-arrow-up-right-dots"></i> App Update</div>
                <div class="form-group mb-2">
                    <label class="form-label">Latest Version</label>
                    <input type="text" name="update_version" class="form-control" value="<?= $val('update_version') ?>" placeholder="1.1.0">
                </div>
                <div class="form-group mb-2">
                    <label class="form-label">Update URL (store / APK)</label>
                    <input type="text" name="update_url" class="form-control" value="<?= $val('update_url') ?>">
                </div>
                <div class="form-group mb-2">
                    <label class="form-label">What's New (changelog)</label>
                    <textarea name="update_message" class="form-control"><?= $val('update_message') ?></textarea>
                </div>
            </div>

            <div class="card card-pad mb-2">
                <div class="card-title"><i class="fa-solid fa-toggle-on"></i> Feature Toggles</div>
                <?php foreach ($toggles as $key => [$label, $desc]): ?>
                    <div class="toggle-row">
                        <div class="t-label"><b><?= $label ?></b><span><?= $desc ?></span></div>
                        <label class="switch"><input type="checkbox" name="<?= $key ?>" value="1" <?= $on($key) ?>><span class="slider"></span></label>
                    </div>
                <?php endforeach; ?>
            </div>

            <div class="card card-pad danger-zone">
                <div class="card-title"><i class="fa-solid fa-triangle-exclamation"></i> Danger Zone</div>
                <p class="muted mb-2">Resetting requires editing <code>.env</code> (set <code>INSTALLED=false</code>) then re-running the installer.</p>
                <a href="index.php?page=logout" class="btn btn-danger-soft"><i class="fa-solid fa-right-from-bracket"></i> Sign Out</a>
            </div>
        </div>
    </div>

    <div class="actions mt-2">
        <button type="submit" class="btn btn-primary"><i class="fa-solid fa-floppy-disk"></i> Save All Settings</button>
    </div>
</form>
