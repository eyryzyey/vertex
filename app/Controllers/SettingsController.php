<?php
class SettingsController
{
    private const TEXT_KEYS = [
        'app_name', 'app_version', 'app_description', 'support_email',
        'privacy_url', 'terms_of_service',
        'update_version', 'update_url', 'update_message',
    ];

    private const TOGGLE_KEYS = [
        'maintenance_mode', 'force_update', 'show_ads',
        'enable_channels', 'enable_movies', 'enable_anime', 'update_enabled',
    ];

    public static function index(): void
    {
        view('settings/index', ['settings' => AppSetting::getAll()]);
    }

    public static function save(): void
    {
        foreach (self::TEXT_KEYS as $key) {
            if (isset($_POST[$key])) {
                AppSetting::save($key, trim((string)$_POST[$key]));
            }
        }
        foreach (self::TOGGLE_KEYS as $key) {
            AppSetting::save($key, isset($_POST[$key]) ? '1' : '0');
        }
        flash('Settings saved successfully');
        redirect('index.php?page=settings');
    }
}
