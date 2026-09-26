<div class="page-header">
    <div>
        <h1><?= $anime ? 'Edit Anime' : 'Add Anime' ?></h1>
        <div class="breadcrumb"><a href="index.php?page=anime">Anime</a> / <?= $anime ? 'Edit' : 'Create' ?></div>
    </div>
</div>

<div class="card card-pad mb-2" style="max-width:820px">
    <form method="POST" enctype="multipart/form-data" action="index.php?page=anime&action=<?= $anime ? 'update' : 'store' ?>">
        <?php if ($anime): ?><input type="hidden" name="id" value="<?= (int)$anime['id'] ?>"><?php endif; ?>
        <div class="form-grid">
            <div class="form-group full">
                <label class="form-label">Title</label>
                <input type="text" name="title" class="form-control" required value="<?= e($anime['title'] ?? '') ?>" placeholder="Anime title">
            </div>
            <div class="form-group full">
                <label class="form-label">Description</label>
                <textarea name="description" class="form-control" placeholder="Synopsis..."><?= e($anime['description'] ?? '') ?></textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Release Year</label>
                <input type="number" name="release_year" class="form-control" min="1960" max="2099" value="<?= e($anime['release_year'] ?? '') ?>" placeholder="2024">
            </div>
            <div class="form-group">
                <label class="form-label">Category</label>
                <select name="category_id" class="form-control">
                    <option value="">— None —</option>
                    <?php foreach ($categories as $c): ?>
                        <option value="<?= (int)$c['id'] ?>" <?= ($anime['category_id'] ?? '') == $c['id'] ? 'selected' : '' ?>><?= e($c['name']) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="form-group full">
                <label class="form-label">Poster</label>
                <label class="file-drop">
                    <i class="fa-solid fa-cloud-arrow-up"></i>
                    <span><?= $anime && $anime['poster'] ? 'Replace poster (' . e(basename($anime['poster'])) . ')' : 'Click to upload poster image' ?></span>
                    <input type="file" name="poster" accept="image/*">
                </label>
            </div>
        </div>
        <div class="actions mt-2">
            <button type="submit" class="btn btn-primary"><i class="fa-solid fa-floppy-disk"></i> <?= $anime ? 'Update Anime' : 'Save Anime' ?></button>
            <a href="index.php?page=anime" class="btn btn-outline">Cancel</a>
        </div>
    </form>
</div>

<?php if ($anime): ?>
<div class="card card-pad" style="max-width:820px">
    <div class="card-title"><i class="fa-solid fa-list"></i> Episodes (<?= count($episodes) ?>)</div>

    <form method="POST" action="index.php?page=anime&action=add_episode" class="form-grid mb-2" style="align-items:end">
        <input type="hidden" name="anime_id" value="<?= (int)$anime['id'] ?>">
        <div class="form-group">
            <label class="form-label">Episode #</label>
            <input type="number" name="episode_number" class="form-control" min="1" required value="<?= count($episodes) + 1 ?>">
        </div>
        <div class="form-group">
            <label class="form-label">Title (optional)</label>
            <input type="text" name="episode_title" class="form-control" placeholder="e.g. The Beginning">
        </div>
        <div class="form-group">
            <label class="form-label">Video URL</label>
            <input type="text" name="video_url" class="form-control" required placeholder="https://.../ep1.mp4">
        </div>
        <div class="form-group">
            <button type="submit" class="btn btn-primary" style="width:100%"><i class="fa-solid fa-plus"></i> Add Episode</button>
        </div>
    </form>

    <div class="table-wrap">
    <table class="table">
        <thead><tr><th>#</th><th>Title</th><th>Video URL</th><th></th></tr></thead>
        <tbody>
        <?php foreach ($episodes as $ep): ?>
            <tr>
                <td><span class="badge badge-info"><?= (int)$ep['episode_number'] ?></span></td>
                <td><?= e($ep['title'] ?? '—') ?></td>
                <td class="muted" style="max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><?= e($ep['video_url']) ?></td>
                <td><a href="index.php?page=anime&action=delete_episode&id=<?= (int)$ep['id'] ?>&anime_id=<?= (int)$anime['id'] ?>" data-confirm="Delete this episode?" class="btn btn-danger-soft btn-sm"><i class="fa-solid fa-trash"></i></a></td>
            </tr>
        <?php endforeach; ?>
        <?php if (!$episodes): ?><tr><td colspan="4" class="muted">No episodes yet.</td></tr><?php endif; ?>
        </tbody>
    </table>
    </div>
</div>
<?php endif; ?>
