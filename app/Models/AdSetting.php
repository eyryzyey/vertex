<?php
class AdSetting
{
    public static function getAll(): array
    {
        return db()->query('SELECT * FROM ad_settings ORDER BY id ASC')->fetchAll();
    }

    public static function getByNetwork(string $network): ?array
    {
        $st = db()->prepare('SELECT * FROM ad_settings WHERE network_name = ?');
        $st->execute([$network]);
        return $st->fetch() ?: null;
    }

    public static function save(string $network, array $settings, bool $isActive): void
    {
        $json = json_encode($settings, JSON_UNESCAPED_UNICODE);
        $st = db()->prepare(
            'INSERT INTO ad_settings (network_name, settings_json, is_active)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE settings_json = VALUES(settings_json), is_active = VALUES(is_active)'
        );
        $st->execute([$network, $json, $isActive ? 1 : 0]);
    }

    public static function delete(string $network): bool
    {
        return db()->prepare('DELETE FROM ad_settings WHERE network_name = ?')->execute([$network]);
    }

    public static function getActiveAds(): array
    {
        $rows = db()->query('SELECT * FROM ad_settings WHERE is_active = 1')->fetchAll();
        foreach ($rows as &$r) {
            $r['settings'] = json_decode($r['settings_json'] ?? 'null', true) ?: new stdClass();
            unset($r['settings_json']);
        }
        return $rows;
    }
}
