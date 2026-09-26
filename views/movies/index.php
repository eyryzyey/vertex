<div class="page-header">
    <div>
        <h1>Movies</h1>
        <div class="breadcrumb"><a href="index.php?page=dashboard">Home</a> / Movies</div>
    </div>
    <a href="index.php?page=movies&action=create" class="btn btn-primary"><i class="fa-solid fa-plus"></i> Add Movie</a>
</div>

<div class="card card-pad">
    <div class="table-wrap">
    <table class="table">
        <thead><tr><th></th><th>Title</th><th>Year</th><th>Category</th><th>Created</th><th>Actions</th></tr></thead>
        <tbody>
        <?php foreach ($movies as $m): ?>
            <tr>
                <td><?= $m['poster'] ? '<img class="thumb" src="' . e($m['poster']) . '" alt="">' : '<span class="thumb-ph"><i class="fa-solid fa-film"></i></span>' ?></td>
                <td><b><?= e($m['title']) ?></b></td>
                <td><?= e($m['release_year'] ?? '—') ?></td>
                <td><?= e($m['category_name'] ?? '—') ?></td>
                <td class="muted"><?= e(date('Y-m-d', strtotime($m['created_at']))) ?></td>
                <td class="actions">
                    <a href="index.php?page=movies&action=edit&id=<?= (int)$m['id'] ?>" class="btn btn-outline btn-sm"><i class="fa-solid fa-pen"></i></a>
                    <a href="index.php?page=movies&action=delete&id=<?= (int)$m['id'] ?>" data-confirm="Delete this movie?" class="btn btn-danger-soft btn-sm"><i class="fa-solid fa-trash"></i></a>
                </td>
            </tr>
        <?php endforeach; ?>
        <?php if (!$movies): ?><tr><td colspan="6"><div class="empty-state"><i class="fa-solid fa-film"></i>No movies yet — add your first one!</div></td></tr><?php endif; ?>
        </tbody>
    </table>
    </div>
</div>
