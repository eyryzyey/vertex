<div class="page-header">
    <div>
        <h1><?= $movie ? 'Edit Movie' : 'Add Movie' ?></h1>
        <div class="breadcrumb"><a href="index.php?page=movies">Movies</a> / <?= $movie ? 'Edit' : 'Create' ?></div>
    </div>
</div>

<div class="card card-pad" style="max-width:820px">
    <form method="POST" enctype="multipart/form-data" action="index.php?page=movies&action=<?= $movie ? 'update' : 'store' ?>">
        <?php if ($movie): ?><input type="hidden" name="id" value="<?= (int)$movie['id'] ?>"><?php endif; ?>
        <div class="form-grid">
            <div class="form-group full">
                <label class="form-label">Title</label>
                <input type="text" name="title" class="form-control" required value="<?= e($movie['title'] ?? '') ?>" placeholder="Movie title">
            </div>
            <div class="form-group full">
                <label class="form-label">Description</label>
                <textarea name="description" class="form-control" placeholder="Short synopsis..."><?= e($movie['description'] ?? '') ?></textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Release Year</label>
                <input type="number" name="release_year" class="form-control" min="1900" max="2099" value="<?= e($movie['release_year'] ?? '') ?>" placeholder="2024">
            </div>
            <div class="form-group">
                <label class="form-label">Category</label>
                <select name="category_id" class="form-control">
                    <option value="">— None —</option>
                    <?php foreach ($categories as $c): ?>
                        <option value="<?= (int)$c['id'] ?>" <?= ($movie['category_id'] ?? '') == $c['id'] ? 'selected' : '' ?>><?= e($c['name']) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="form-group full">
                <label class="form-label">Video URL</label>
                <div class="input-icon"><i class="fa-solid fa-link"></i>
                    <input type="text" name="video_url" class="form-control" required value="<?= e($movie['video_url'] ?? '') ?>" placeholder="https://.../movie.mp4">
                </div>
            </div>
            <div class="form-group full">
                <label class="form-label">Poster</label>
                <label class="file-drop">
                    <i class="fa-solid fa-cloud-arrow-up"></i>
                    <span><?= $movie && $movie['poster'] ? 'Replace poster (' . e(basename($movie['poster'])) . ')' : 'Click to upload poster image' ?></span>
                    <input type="file" name="poster" accept="image/*">
                </label>
            </div>
        </div>
        <div class="actions mt-2">
            <button type="submit" class="btn btn-primary"><i class="fa-solid fa-floppy-disk"></i> <?= $movie ? 'Update Movie' : 'Save Movie' ?></button>
            <a href="index.php?page=movies" class="btn btn-outline">Cancel</a>
        </div>
    </form>
</div>
