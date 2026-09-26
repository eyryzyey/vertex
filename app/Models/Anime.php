<?php
class Anime
{
    public static function getAll(): array
    {
        return db()->query(
            'SELECT a.*, cat.name AS category_name,
                    (SELECT COUNT(*) FROM anime_episodes ep WHERE ep.anime_id = a.id) AS episode_count
             FROM anime a LEFT JOIN categories cat ON cat.id = a.category_id
             ORDER BY a.id DESC'
        )->fetchAll();
    }

    public static function getById(int $id): ?array
    {
        $st = db()->prepare('SELECT * FROM anime WHERE id = ?');
        $st->execute([$id]);
        return $st->fetch() ?: null;
    }

    public static function create(array $d): int
    {
        $st = db()->prepare(
            'INSERT INTO anime (title, description, release_year, poster, category_id) VALUES (?, ?, ?, ?, ?)'
        );
        $st->execute([
            $d['title'], $d['description'], $d['release_year'], $d['poster'], $d['category_id'],
        ]);
        return (int)db()->lastInsertId();
    }

    public static function update(int $id, array $d): bool
    {
        $st = db()->prepare(
            'UPDATE anime SET title = ?, description = ?, release_year = ?, poster = ?, category_id = ? WHERE id = ?'
        );
        return $st->execute([
            $d['title'], $d['description'], $d['release_year'], $d['poster'], $d['category_id'], $id,
        ]);
    }

    public static function delete(int $id): bool
    {
        // episodes removed by FK ON DELETE CASCADE
        return db()->prepare('DELETE FROM anime WHERE id = ?')->execute([$id]);
    }

    public static function count(): int
    {
        return (int)db()->query('SELECT COUNT(*) FROM anime')->fetchColumn();
    }

    public static function getEpisodes(int $animeId): array
    {
        $st = db()->prepare('SELECT * FROM anime_episodes WHERE anime_id = ? ORDER BY episode_number ASC');
        $st->execute([$animeId]);
        return $st->fetchAll();
    }

    public static function addEpisode(int $animeId, int $number, ?string $title, string $videoUrl): int
    {
        $st = db()->prepare(
            'INSERT INTO anime_episodes (anime_id, episode_number, title, video_url) VALUES (?, ?, ?, ?)'
        );
        $st->execute([$animeId, $number, $title, $videoUrl]);
        return (int)db()->lastInsertId();
    }

    public static function deleteEpisode(int $id): bool
    {
        return db()->prepare('DELETE FROM anime_episodes WHERE id = ?')->execute([$id]);
    }
}
