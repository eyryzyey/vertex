<?php
// ============================================
// StreamVault API — public/index.php
// Serves: index.php?route=api&endpoint={name}
// Response format: { "status": "...", "data": ..., "message": "..." }
// ============================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../config/database.php';

$route    = $_GET['route']    ?? '';
$endpoint = $_GET['endpoint'] ?? '';

if ($route !== 'api') {
    json_out('error', null, 'Invalid route');
}

// Default settings (used when DB rows are missing)
$SETTINGS_DEFAULTS = [
    'app_name'          => 'Farjni',
    'app_version'       => '1.0.0',
    'app_description'   => '',
    'maintenance_mode'  => '0',
    'force_update'      => '0',
    'show_ads'          => '1',
    'enable_channels'   => '1',
    'enable_movies'     => '1',
    'enable_anime'      => '1',
    'update_enabled'    => '0',
    'update_version'    => '',
    'update_url'        => '',
    'update_message'    => '',
    'support_email'     => '',
    'privacy_url'       => '',
    'terms_of_service'  => '',
];

function json_out(string $status, $data = null, string $message = ''): void {
    echo json_encode(['status' => $status, 'data' => $data, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

function get_settings_map(): array {
    global $SETTINGS_DEFAULTS;
    $rows = db()->query('SELECT `key`, `value` FROM settings')->fetchAll();
    $map = $SETTINGS_DEFAULTS;
    foreach ($rows as $r) { $map[$r['key']] = $r['value']; }
    return $map;
}

try {
    switch ($endpoint) {

        // ---------- Settings ----------
        case 'settings': {
            $s = get_settings_map();
            json_out('success', [
                'app_name'          => $s['app_name'],
                'app_version'       => $s['app_version'],
                'app_description'   => $s['app_description'],
                'maintenance_mode'  => $s['maintenance_mode'] === '1',
                'force_update'      => $s['force_update'] === '1',
                'show_ads'          => $s['show_ads'] === '1',
                'enable_channels'   => $s['enable_channels'] === '1',
                'enable_movies'     => $s['enable_movies'] === '1',
                'enable_anime'      => $s['enable_anime'] === '1',
                'update_enabled'    => $s['update_enabled'] === '1',
                'update_version'    => $s['update_version'],
                'update_url'        => $s['update_url'],
                'update_message'    => $s['update_message'],
                'support_email'     => $s['support_email'],
                'privacy_url'       => $s['privacy_url'],
                'terms_of_service'  => $s['terms_of_service'],
            ]);
        }

        // ---------- Check update ----------
        case 'check-update': {
            $s = get_settings_map();
            json_out('success', [
                'update_enabled' => $s['update_enabled'] === '1',
                'force_update'   => $s['force_update'] === '1',
                'latest_version' => $s['update_version'],
                'update_url'     => $s['update_url'],
                'update_message' => $s['update_message'],
            ]);
        }

        // ---------- Categories ----------
        case 'categories': {
            $rows = db()->query(
                "SELECT c.id, c.name, c.type FROM categories c ORDER BY c.id DESC"
            )->fetchAll();
            json_out('success', $rows);
        }

        // ---------- Channels ----------
        case 'channels': {
            $rows = db()->query(
                "SELECT ch.id, ch.name, ch.logo, ch.stream_url,
                        ch.category_id, COALESCE(c.name, '') AS category_name
                 FROM channels ch
                 LEFT JOIN categories c ON c.id = ch.category_id
                 WHERE ch.is_active = 1
                 ORDER BY ch.id DESC"
            )->fetchAll();
            json_out('success', $rows);
        }

        // ---------- Movies ----------
        case 'movies': {
            $rows = db()->query(
                "SELECT m.id, m.title, m.poster, m.release_year, m.synopsis,
                        m.video_url, m.category_id, COALESCE(c.name, '') AS category_name
                 FROM movies m
                 LEFT JOIN categories c ON c.id = m.category_id
                 WHERE m.is_active = 1
                 ORDER BY m.id DESC"
            )->fetchAll();
            json_out('success', $rows);
        }

        // ---------- Anime (with nested episodes) ----------
        case 'anime': {
            $rows = db()->query(
                "SELECT a.id, a.title, a.poster, a.release_year, a.synopsis,
                        a.category_id, COALESCE(c.name, '') AS category_name
                 FROM anime a
                 LEFT JOIN categories c ON c.id = a.category_id
                 WHERE a.is_active = 1
                 ORDER BY a.id DESC"
            )->fetchAll();

            $epStmt = db()->prepare(
                "SELECT id, episode_number, title, video_url
                 FROM anime_episodes WHERE anime_id = ? ORDER BY episode_number ASC"
            );
            foreach ($rows as &$a) {
                $epStmt->execute([$a['id']]);
                $a['episodes'] = $epStmt->fetchAll();
            }
            json_out('success', $rows);
        }

        // ---------- Ads config ----------
        case 'ads': {
            $rows = db()->query('SELECT * FROM ads')->fetchAll();
            $map = [];
            foreach ($rows as $r) {
                $network = $r['network'];
                $map[$network] = [
                    'is_active'            => (bool)$r['is_active'],
                    'app_id'               => $r['app_id'],
                    'sdk_key'              => $r['sdk_key'],
                    'game_id'              => $r['game_id'],
                    'banner_id'            => $r['banner_id'],
                    'interstitial_id'      => $r['interstitial_id'],
                    'rewarded_id'          => $r['rewarded_id'],
                    'native_id'            => $r['native_id'],
                    'banner_placement'     => $r['banner_placement'],
                    'interstitial_placement'=> $r['interstitial_placement'],
                    'rewarded_placement'   => $r['rewarded_placement'],
                    'return_ad'            => $r['return_ad'],
                    'interstitial_type'    => $r['interstitial_type'],
                    'test_mode'            => $r['test_mode'],
                ];
            }
            json_out('success', $map);
        }

        default:
            json_out('error', null, 'Unknown endpoint: ' . $endpoint);
    }
} catch (Throwable $e) {
    // Resilient error handling: never crash the app, return safe defaults
    json_out('error', null, 'Server error');
}
