<?php
class Category
{
    public static function getAll(): array
    {
        return db()->query('SELECT * FROM categories ORDER BY id DESC')->fetchAll();
    }

    public static function getById(int $id): ?array
    {
        $st = db()->prepare('SELECT * FROM categories WHERE id = ?');
        $st->execute([$id]);
        return $st->fetch() ?: null;
    }

    public static function create(string $name, string $type): int
    {
        $st = db()->prepare('INSERT INTO categories (name, type) VALUES (?, ?)');
        $st->execute([$name, $type]);
        return (int)db()->lastInsertId();
    }

    public static function update(int $id, string $name, string $type): bool
    {
        $st = db()->prepare('UPDATE categories SET name = ?, type = ? WHERE id = ?');
        return $st->execute([$name, $type, $id]);
    }

    public static function delete(int $id): bool
    {
        return db()->prepare('DELETE FROM categories WHERE id = ?')->execute([$id]);
    }

    public static function count(): int
    {
        return (int)db()->query('SELECT COUNT(*) FROM categories')->fetchColumn();
    }
}
