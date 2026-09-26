<?php
/** JSON API for the mobile app — URL: api.php?endpoint={endpoint} */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

function api_ok($data): void
{
    echo json_encode(['status' => 'success', 'data' => $data], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function api_err(string $msg, int $code = 404): void
{
    http_response_code($code);
    echo json_encode(['status' => 'error', 'message' => $msg]);
    exit;
}

try {
    $endpoint = $_GET['endpoint'] ?? '';

    switch ($endpoint) {
        case 'categories':
            api_ok(Category::getAll());

        case 'channels':
            api_ok(Channel::getAll());

        case 'movies':
            api_ok(Movie::getAll());

        case 'anime':
            $list = Anime::getAll();
            foreach ($list as &$a) {
                $a['episodes'] = Anime::getEpisodes((int)$a['id']);
            }
            api_ok($list);

        case 'ads':
            api_ok(AppSetting::get('show_ads', '1') === '1' ? AdSetting::getActiveAds() : []);

        case 'settings':
            api_ok(AppSetting::getAll());

        case 'check-update':
            $appVersion = AppSetting::get('app_version', '1.0.0');
            $updateVersion = AppSetting::get('update_version', $appVersion);
            api_ok([
                'update_enabled' => AppSetting::get('update_enabled', '0') === '1',
                'update_available' => version_compare($updateVersion, $appVersion, '>'),
                'latest_version' => $updateVersion,
                'current_version' => $appVersion,
                'update_url' => AppSetting::get('update_url', ''),
                'update_message' => AppSetting::get('update_message', ''),
                'force_update' => AppSetting::get('force_update', '0') === '1',
            ]);

        default:
            api_err('Unknown endpoint', 404);
    }
} catch (Throwable $t) {
    api_err('Server error: ' . $t->getMessage(), 500);
}
