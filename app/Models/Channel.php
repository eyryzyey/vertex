<?php
class Channel
{
    public static function getAll(): array
    {
        return db()->query(
            'SELECT c.*, cat.name AS category_name
             FROM channels c LEFT JOIN categories cat ON cat.id = c.category_id
             ORDER BY c.id DESC'
        )->fetchAll();
    }

    public static function recent(int $limit = 5): array
    {
        $st = db()->prepare(
            'SELECT c.*, cat.name AS category_name
             FROM channels c LEFT JOIN categories cat ON cat.id = c.category_id
             ORDER BY c.id DESC LIMIT ?'
        );
        $st->bindValue(1, $limit, PDO::PARAM_INT);
        $st->execute();
        return $st->fetchAll();
    }

    public static function getById(int $id): ?array
    {
        $st = db()->prepare('SELECT * FROM channels WHERE id = ?');
        $st->execute([$id]);
        return $st->fetch() ?: null;
    }

    public static function create(array $d): int
    {
        $st = db()->prepare(
            'INSERT INTO channels (name, logo, m3u_link, category_id, status) VALUES (?, ?, ?, ?, ?)'
        );
        $st->execute([$d['name'], $d['logo'], $d['m3u_link'], $d['category_id'], $d['status']]);
        return (int)db()->lastInsertId();
    }

    public static function update(int $id, array $d): bool
    {
        $st = db()->prepare(
            'UPDATE channels SET name = ?, logo = ?, m3u_link = ?, category_id = ?, status = ? WHERE id = ?'
        );
        return $st->execute([$d['name'], $d['logo'], $d['m3u_link'], $d['category_id'], $d['status'], $id]);
    }

    public static function delete(int $id): bool
    {
        return db()->prepare('DELETE FROM channels WHERE id = ?')->execute([$id]);
    }

    public static function count(): int
    {
        return (int)db()->query('SELECT COUNT(*) FROM channels')->fetchColumn();
    }
}
