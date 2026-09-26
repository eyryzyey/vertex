<?php
class Movie
{
    public static function getAll(): array
    {
        return db()->query(
            'SELECT m.*, cat.name AS category_name
             FROM movies m LEFT JOIN categories cat ON cat.id = m.category_id
             ORDER BY m.id DESC'
        )->fetchAll();
    }

    public static function recent(int $limit = 5): array
    {
        $st = db()->prepare(
            'SELECT m.*, cat.name AS category_name
             FROM movies m LEFT JOIN categories cat ON cat.id = m.category_id
             ORDER BY m.id DESC LIMIT ?'
        );
        $st->bindValue(1, $limit, PDO::PARAM_INT);
        $st->execute();
        return $st->fetchAll();
    }

    public static function getById(int $id): ?array
    {
        $st = db()->prepare('SELECT * FROM movies WHERE id = ?');
        $st->execute([$id]);
        return $st->fetch() ?: null;
    }

    public static function create(array $d): int
    {
        $st = db()->prepare(
            'INSERT INTO movies (title, description, release_year, poster, video_url, category_id)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $st->execute([
            $d['title'], $d['description'], $d['release_year'],
            $d['poster'], $d['video_url'], $d['category_id'],
        ]);
        return (int)db()->lastInsertId();
    }

    public static function update(int $id, array $d): bool
    {
        $st = db()->prepare(
            'UPDATE movies SET title = ?, description = ?, release_year = ?, poster = ?, video_url = ?, category_id = ? WHERE id = ?'
        );
        return $st->execute([
            $d['title'], $d['description'], $d['release_year'],
            $d['poster'], $d['video_url'], $d['category_id'], $id,
        ]);
    }

    public static function delete(int $id): bool
    {
        return db()->prepare('DELETE FROM movies WHERE id = ?')->execute([$id]);
    }

    public static function count(): int
    {
        return (int)db()->query('SELECT COUNT(*) FROM movies')->fetchColumn();
    }
}
