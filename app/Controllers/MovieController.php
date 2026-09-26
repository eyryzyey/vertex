<?php
class MovieController
{
    private static function categories(): array
    {
        return array_values(array_filter(Category::getAll(), fn($c) => in_array($c['type'], ['movie', 'general'], true)));
    }

    public static function index(): void
    {
        view('movies/index', ['movies' => Movie::getAll()]);
    }

    public static function create(): void
    {
        view('movies/form', ['movie' => null, 'categories' => self::categories()]);
    }

    public static function edit(): void
    {
        $movie = Movie::getById((int)($_GET['id'] ?? 0));
        if (!$movie) {
            flash('Movie not found', 'danger');
            redirect('index.php?page=movies');
        }
        view('movies/form', ['movie' => $movie, 'categories' => self::categories()]);
    }

    private static function collect(array $old = null): array
    {
        $poster = handle_upload($_FILES['poster'] ?? [], 'movies', 'mov') ?? ($old['poster'] ?? null);
        return [
            'title' => trim($_POST['title'] ?? ''),
            'description' => trim($_POST['description'] ?? '') ?: null,
            'release_year' => $_POST['release_year'] !== '' ? (int)$_POST['release_year'] : null,
            'poster' => $poster,
            'video_url' => trim($_POST['video_url'] ?? ''),
            'category_id' => $_POST['category_id'] !== '' ? (int)$_POST['category_id'] : null,
        ];
    }

    public static function store(): void
    {
        $d = self::collect();
        if ($d['title'] === '' || $d['video_url'] === '') {
            flash('Title and video URL are required', 'danger');
            redirect('index.php?page=movies&action=create');
        }
        Movie::create($d);
        flash('Movie created successfully');
        redirect('index.php?page=movies');
    }

    public static function update(): void
    {
        $id = (int)($_POST['id'] ?? 0);
        $old = Movie::getById($id);
        if (!$old) {
            redirect('index.php?page=movies');
        }
        Movie::update($id, self::collect($old));
        flash('Movie updated successfully');
        redirect('index.php?page=movies');
    }

    public static function delete(): void
    {
        $id = (int)($_GET['id'] ?? 0);
        if ($id) {
            Movie::delete($id);
            flash('Movie deleted');
        }
        redirect('index.php?page=movies');
    }
}
