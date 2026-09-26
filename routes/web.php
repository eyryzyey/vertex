<?php
/** Main dashboard router — URL: index.php?page={page}&action={action}&id={id} */
$page = $_GET['page'] ?? 'dashboard';
$action = $_GET['action'] ?? 'index';

switch ($page) {
    case 'dashboard':
        DashboardController::index();
        break;

    case 'categories':
        switch ($action) {
            case 'store': CategoryController::store(); break;
            case 'update': CategoryController::update(); break;
            case 'delete': CategoryController::delete(); break;
            default: CategoryController::index(); break;
        }
        break;

    case 'channels':
        switch ($action) {
            case 'create': ChannelController::create(); break;
            case 'edit': ChannelController::edit(); break;
            case 'store': ChannelController::store(); break;
            case 'update': ChannelController::update(); break;
            case 'delete': ChannelController::delete(); break;
            default: ChannelController::index(); break;
        }
        break;

    case 'movies':
        switch ($action) {
            case 'create': MovieController::create(); break;
            case 'edit': MovieController::edit(); break;
            case 'store': MovieController::store(); break;
            case 'update': MovieController::update(); break;
            case 'delete': MovieController::delete(); break;
            default: MovieController::index(); break;
        }
        break;

    case 'anime':
        switch ($action) {
            case 'create': AnimeController::create(); break;
            case 'edit': AnimeController::edit(); break;
            case 'store': AnimeController::store(); break;
            case 'update': AnimeController::update(); break;
            case 'delete': AnimeController::delete(); break;
            case 'add_episode': AnimeController::addEpisode(); break;
            case 'delete_episode': AnimeController::deleteEpisode(); break;
            default: AnimeController::index(); break;
        }
        break;

    case 'ads':
        switch ($action) {
            case 'save': AdController::save(); break;
            case 'delete': AdController::delete(); break;
            default: AdController::index(); break;
        }
        break;

    case 'settings':
        if ($action === 'save') {
            SettingsController::save();
        } else {
            SettingsController::index();
        }
        break;

    default:
        http_response_code(404);
        view('dashboard/index', [
            'stats' => [
                'categories' => Category::count(),
                'channels' => Channel::count(),
                'movies' => Movie::count(),
                'anime' => Anime::count(),
            ],
            'recentChannels' => Channel::recent(5),
            'recentMovies' => Movie::recent(5),
        ]);
        break;
}
