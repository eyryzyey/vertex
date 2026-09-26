<?php
class AppSetting
{
    public static function getAll(): array
    {
        $rows = db()->query('SELECT setting_key, setting_value FROM app_settings')->fetchAll();
        $out = [];
        foreach ($rows as $r) {
            $out[$r['setting_key']] = $r['setting_value'];
        }
        return $out;
    }

    public static function get(string $key, string $default = ''): string
    {
        $st = db()->prepare('SELECT setting_value FROM app_settings WHERE setting_key = ?');
        $st->execute([$key]);
        $v = $st->fetchColumn();
        return $v === false ? $default : (string)$v;
    }

    public static function save(string $key, ?string $value): void
    {
        $st = db()->prepare(
            'INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)'
        );
        $st->execute([$key, $value]);
    }
}
