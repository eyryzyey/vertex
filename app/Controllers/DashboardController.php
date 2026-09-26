<?php
class DashboardController
{
    public static function index(): void
    {
        $stats = [
            'categories' => Category::count(),
            'channels' => Channel::count(),
            'movies' => Movie::count(),
            'anime' => Anime::count(),
        ];
        view('dashboard/index', [
            'stats' => $stats,
            'recentChannels' => Channel::recent(5),
            'recentMovies' => Movie::recent(5),
        ]);
    }
}
