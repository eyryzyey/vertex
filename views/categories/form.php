<div class="page-header">
    <div>
        <h1>Categories</h1>
        <div class="breadcrumb"><a href="index.php?page=dashboard">Home</a> / Categories</div>
    </div>
</div>

<div class="grid-2">
    <div class="card card-pad">
        <div class="card-title"><i class="fa-solid <?= $edit ? 'fa-pen' : 'fa-plus' ?>"></i> <?= $edit ? 'Edit Category' : 'Create Category' ?></div>
        <form method="POST" action="index.php?page=categories&action=<?= $edit ? 'update' : 'store' ?>">
            <?php if ($edit): ?><input type="hidden" name="id" value="<?= (int)$edit['id'] ?>"><?php endif; ?>
            <div class="form-group mb-2">
                <label class="form-label">Name</label>
                <input type="text" name="name" class="form-control" required value="<?= e($edit['name'] ?? '') ?>" placeholder="e.g. Sports">
            </div>
            <div class="form-group mb-2">
                <label class="form-label">Type</label>
                <select name="type" class="form-control">
                    <?php foreach (['general', 'movie', 'channel', 'anime'] as $t): ?>
                        <option value="<?= $t ?>" <?= ($edit['type'] ?? 'general') === $t ? 'selected' : '' ?>><?= ucfirst($t) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="actions">
                <button type="submit" class="btn btn-primary"><i class="fa-solid fa-floppy-disk"></i> <?= $edit ? 'Update' : 'Save' ?></button>
                <?php if ($edit): ?><a href="index.php?page=categories" class="btn btn-outline">Cancel</a><?php endif; ?>
            </div>
        </form>
    </div>

    <div class="card card-pad">
        <div class="card-title"><i class="fa-solid fa-layer-group"></i> All Categories (<?= count($categories) ?>)</div>
        <div class="table-wrap">
        <table class="table">
            <thead><tr><th>Name</th><th>Type</th><th>Actions</th></tr></thead>
            <tbody>
            <?php foreach ($categories as $c): ?>
                <tr>
                    <td><b><?= e($c['name']) ?></b></td>
                    <td><span class="badge badge-info"><?= e(ucfirst($c['type'])) ?></span></td>
                    <td class="actions">
                        <a href="index.php?page=categories&action=edit&id=<?= (int)$c['id'] ?>" class="btn btn-outline btn-sm"><i class="fa-solid fa-pen"></i></a>
                        <a href="index.php?page=categories&action=delete&id=<?= (int)$c['id'] ?>" data-confirm="Delete this category?" class="btn btn-danger-soft btn-sm"><i class="fa-solid fa-trash"></i></a>
                    </td>
                </tr>
            <?php endforeach; ?>
            <?php if (!$categories): ?><tr><td colspan="3" class="empty-state"><i class="fa-solid fa-layer-group"></i>No categories yet</td></tr><?php endif; ?>
            </tbody>
        </table>
        </div>
    </div>
</div>
