<div class="page-header">
    <div>
        <h1><?= $channel ? 'Edit Channel' : 'Add Channel' ?></h1>
        <div class="breadcrumb"><a href="index.php?page=channels">Channels</a> / <?= $channel ? 'Edit' : 'Create' ?></div>
    </div>
</div>

<div class="card card-pad" style="max-width:760px">
    <form method="POST" enctype="multipart/form-data" action="index.php?page=channels&action=<?= $channel ? 'update' : 'store' ?>">
        <?php if ($channel): ?><input type="hidden" name="id" value="<?= (int)$channel['id'] ?>"><?php endif; ?>
        <div class="form-grid">
            <div class="form-group">
                <label class="form-label">Channel Name</label>
                <input type="text" name="name" class="form-control" required value="<?= e($channel['name'] ?? '') ?>" placeholder="e.g. BeIN Sports">
            </div>
            <div class="form-group">
                <label class="form-label">Category</label>
                <select name="category_id" class="form-control">
                    <option value="">— None —</option>
                    <?php foreach ($categories as $c): ?>
                        <option value="<?= (int)$c['id'] ?>" <?= ($channel['category_id'] ?? '') == $c['id'] ? 'selected' : '' ?>><?= e($c['name']) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="form-group full">
                <label class="form-label">M3U / Stream URL</label>
                <div class="input-icon"><i class="fa-solid fa-link"></i>
                    <input type="text" name="m3u_link" class="form-control" required value="<?= e($channel['m3u_link'] ?? '') ?>" placeholder="https://.../stream.m3u8">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Status</label>
                <select name="status" class="form-control">
                    <option value="active" <?= ($channel['status'] ?? 'active') === 'active' ? 'selected' : '' ?>>Active</option>
                    <option value="inactive" <?= ($channel['status'] ?? '') === 'inactive' ? 'selected' : '' ?>>Inactive</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Logo</label>
                <label class="file-drop" style="padding:16px">
                    <i class="fa-solid fa-cloud-arrow-up"></i>
                    <span><?= $channel && $channel['logo'] ? 'Replace logo (' . e(basename($channel['logo'])) . ')' : 'Click to upload logo' ?></span>
                    <input type="file" name="logo" accept="image/*">
                </label>
            </div>
        </div>
        <div class="actions mt-2">
            <button type="submit" class="btn btn-primary"><i class="fa-solid fa-floppy-disk"></i> <?= $channel ? 'Update Channel' : 'Save Channel' ?></button>
            <a href="index.php?page=channels" class="btn btn-outline">Cancel</a>
        </div>
    </form>
</div>
