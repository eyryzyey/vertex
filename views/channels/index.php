<div class="page-header">
    <div>
        <h1>Channels</h1>
        <div class="breadcrumb"><a href="index.php?page=dashboard">Home</a> / Channels</div>
    </div>
    <a href="index.php?page=channels&action=create" class="btn btn-primary"><i class="fa-solid fa-plus"></i> Add Channel</a>
</div>

<div class="card card-pad">
    <div class="table-wrap">
    <table class="table">
        <thead><tr><th></th><th>Name</th><th>Category</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
        <tbody>
        <?php foreach ($channels as $ch): ?>
            <tr>
                <td><?= $ch['logo'] ? '<img class="thumb" src="' . e($ch['logo']) . '" alt="">' : '<span class="thumb-ph"><i class="fa-solid fa-tv"></i></span>' ?></td>
                <td><b><?= e($ch['name']) ?></b></td>
                <td><?= e($ch['category_name'] ?? '—') ?></td>
                <td><span class="badge badge-<?= $ch['status'] === 'active' ? 'success' : 'danger' ?>"><?= e(ucfirst($ch['status'])) ?></span></td>
                <td class="muted"><?= e(date('Y-m-d', strtotime($ch['created_at']))) ?></td>
                <td class="actions">
                    <a href="index.php?page=channels&action=edit&id=<?= (int)$ch['id'] ?>" class="btn btn-outline btn-sm"><i class="fa-solid fa-pen"></i></a>
                    <a href="index.php?page=channels&action=delete&id=<?= (int)$ch['id'] ?>" data-confirm="Delete this channel?" class="btn btn-danger-soft btn-sm"><i class="fa-solid fa-trash"></i></a>
                </td>
            </tr>
        <?php endforeach; ?>
        <?php if (!$channels): ?><tr><td colspan="6"><div class="empty-state"><i class="fa-solid fa-tv"></i>No channels yet — add your first one!</div></td></tr><?php endif; ?>
        </tbody>
    </table>
    </div>
</div>
