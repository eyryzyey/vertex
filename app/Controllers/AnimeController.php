<?php
class AnimeController
{
    private static function categories(): array
    {
        return array_values(array_filter(Category::getAll(), fn($c) => in_array($c['type'], ['anime', 'general'], true)));
    }

    public static function index(): void
    {
        view('anime/index', ['animes' => Anime::getAll()]);
    }

    public static function create(): void
    {
        view('anime/form', ['anime' => null, 'categories' => self::categories(), 'episodes' => []]);
    }

    public static function edit(): void
    {
        $id = (int)($_GET['id'] ?? 0);
        $anime = Anime::getById($id);
        if (!$anime) {
            flash('Anime not found', 'danger');
            redirect('index.php?page=anime');
        }
        view('anime/form', ['anime' => $anime, 'categories' => self::categories(), 'episodes' => Anime::getEpisodes($id)]);
    }

    private static function collect(array $old = null): array
    {
        $poster = handle_upload($_FILES['poster'] ?? [], 'anime', 'ani') ?? ($old['poster'] ?? null);
        return [
            'title' => trim($_POST['title'] ?? ''),
            'description' => trim($_POST['description'] ?? '') ?: null,
            'release_year' => $_POST['release_year'] !== '' ? (int)$_POST['release_year'] : null,
            'poster' => $poster,
            'category_id' => $_POST['category_id'] !== '' ? (int)$_POST['category_id'] : null,
        ];
    }

    public static function store(): void
    {
        $d = self::collect();
        if ($d['title'] === '') {
            flash('Title is required', 'danger');
            redirect('index.php?page=anime&action=create');
        }
        $id = Anime::create($d);
        flash('Anime created — now add episodes');
        redirect("index.php?page=anime&action=edit&id=$id");
    }

    public static function update(): void
    {
        $id = (int)($_POST['id'] ?? 0);
        $old = Anime::getById($id);
        if (!$old) {
            redirect('index.php?page=anime');
        }
        Anime::update($id, self::collect($old));
        flash('Anime updated successfully');
        redirect("index.php?page=anime&action=edit&id=$id");
    }

    public static function delete(): void
    {
        $id = (int)($_GET['id'] ?? 0);
        if ($id) {
            Anime::delete($id);
            flash('Anime deleted');
        }
        redirect('index.php?page=anime');
    }

    public static function addEpisode(): void
    {
        $animeId = (int)($_POST['anime_id'] ?? 0);
        if ($animeId) {
            Anime::addEpisode(
                $animeId,
                (int)($_POST['episode_number'] ?? 0),
                trim($_POST['episode_title'] ?? '') ?: null,
                trim($_POST['video_url'] ?? '')
            );
            flash('Episode added');
        }
        redirect("index.php?page=anime&action=edit&id=$animeId");
    }

    public static function deleteEpisode(): void
    {
        $id = (int)($_GET['id'] ?? 0);
        $animeId = (int)($_GET['anime_id'] ?? 0);
        if ($id) {
            Anime::deleteEpisode($id);
            flash('Episode deleted');
        }
        redirect("index.php?page=anime&action=edit&id=$animeId");
    }
}
