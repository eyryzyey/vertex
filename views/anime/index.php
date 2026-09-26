<div class="page-header">
    <div>
        <h1>Anime</h1>
        <div class="breadcrumb"><a href="index.php?page=dashboard">Home</a> / Anime</div>
    </div>
    <a href="index.php?page=anime&action=create" class="btn btn-primary"><i class="fa-solid fa-plus"></i> Add Anime</a>
</div>

<div class="card card-pad">
    <div class="table-wrap">
    <table class="table">
        <thead><tr><th></th><th>Title</th><th>Year</th><th>Category</th><th>Episodes</th><th>Actions</th></tr></thead>
        <tbody>
        <?php foreach ($animes as $a): ?>
            <tr>
                <td><?= $a['poster'] ? '<img class="thumb" src="' . e($a['poster']) . '" alt="">' : '<span class="thumb-ph"><i class="fa-solid fa-dragon"></i></span>' ?></td>
                <td><b><?= e($a['title']) ?></b></td>
                <td><?= e($a['release_year'] ?? '—') ?></td>
                <td><?= e($a['category_name'] ?? '—') ?></td>
                <td><span class="badge badge-purple"><i class="fa-solid fa-list"></i> <?= (int)$a['episode_count'] ?> ep</span></td>
                <td class="actions">
                    <a href="index.php?page=anime&action=edit&id=<?= (int)$a['id'] ?>" class="btn btn-outline btn-sm"><i class="fa-solid fa-pen"></i></a>
                    <a href="index.php?page=anime&action=delete&id=<?= (int)$a['id'] ?>" data-confirm="Delete this anime and all its episodes?" class="btn btn-danger-soft btn-sm"><i class="fa-solid fa-trash"></i></a>
                </td>
            </tr>
        <?php endforeach; ?>
        <?php if (!$animes): ?><tr><td colspan="6"><div class="empty-state"><i class="fa-solid fa-dragon"></i>No anime yet — add your first series!</div></td></tr><?php endif; ?>
        </tbody>
    </table>
    </div>
</div>
