<div class="page-header">
    <div>
        <h1>Dashboard Overview</h1>
        <div class="breadcrumb"><a href="index.php?page=dashboard">Home</a> / Dashboard</div>
    </div>
    <a href="index.php?page=channels&action=create" class="btn btn-primary"><i class="fa-solid fa-plus"></i> Add Channel</a>
</div>

<div class="stats-grid">
    <div class="card stat-card">
        <div class="stat-icon sky"><i class="fa-solid fa-layer-group"></i></div>
        <div class="stat-body"><h3>Categories</h3><div class="num"><?= (int)$stats['categories'] ?></div><span class="trend"><i class="fa-solid fa-arrow-trend-up"></i> Total</span></div>
    </div>
    <div class="card stat-card">
        <div class="stat-icon green"><i class="fa-solid fa-tv"></i></div>
        <div class="stat-body"><h3>Channels</h3><div class="num"><?= (int)$stats['channels'] ?></div><span class="trend"><i class="fa-solid fa-arrow-trend-up"></i> Live streams</span></div>
    </div>
    <div class="card stat-card">
        <div class="stat-icon orange"><i class="fa-solid fa-film"></i></div>
        <div class="stat-body"><h3>Movies</h3><div class="num"><?= (int)$stats['movies'] ?></div><span class="trend"><i class="fa-solid fa-arrow-trend-up"></i> In library</span></div>
    </div>
    <div class="card stat-card">
        <div class="stat-icon purple"><i class="fa-solid fa-dragon"></i></div>
        <div class="stat-body"><h3>Anime</h3><div class="num"><?= (int)$stats['anime'] ?></div><span class="trend"><i class="fa-solid fa-arrow-trend-up"></i> Series</span></div>
    </div>
</div>

<div class="grid-2">
    <div class="card card-pad">
        <div class="card-title"><i class="fa-solid fa-tv"></i> Recent Channels</div>
        <div class="table-wrap">
        <table class="table">
            <thead><tr><th></th><th>Name</th><th>Category</th><th>Status</th></tr></thead>
            <tbody>
            <?php foreach ($recentChannels as $ch): ?>
                <tr>
                    <td><?= $ch['logo'] ? '<img class="thumb" src="' . e($ch['logo']) . '" alt="">' : '<span class="thumb-ph"><i class="fa-solid fa-tv"></i></span>' ?></td>
                    <td><b><?= e($ch['name']) ?></b></td>
                    <td><?= e($ch['category_name'] ?? '—') ?></td>
                    <td><span class="badge badge-<?= $ch['status'] === 'active' ? 'success' : 'danger' ?>"><?= e(ucfirst($ch['status'])) ?></span></td>
                </tr>
            <?php endforeach; ?>
            <?php if (!$recentChannels): ?><tr><td colspan="4" class="muted">No channels yet.</td></tr><?php endif; ?>
            </tbody>
        </table>
        </div>
        <div class="mt-2"><a href="index.php?page=channels" class="btn btn-outline btn-sm">View all channels <i class="fa-solid fa-arrow-right"></i></a></div>
    </div>

    <div class="card card-pad">
        <div class="card-title"><i class="fa-solid fa-film"></i> Recent Movies</div>
        <div class="table-wrap">
        <table class="table">
            <thead><tr><th></th><th>Title</th><th>Year</th><th>Category</th></tr></thead>
            <tbody>
            <?php foreach ($recentMovies as $mv): ?>
                <tr>
                    <td><?= $mv['poster'] ? '<img class="thumb" src="' . e($mv['poster']) . '" alt="">' : '<span class="thumb-ph"><i class="fa-solid fa-film"></i></span>' ?></td>
                    <td><b><?= e($mv['title']) ?></b></td>
                    <td><?= e($mv['release_year'] ?? '—') ?></td>
                    <td><?= e($mv['category_name'] ?? '—') ?></td>
                </tr>
            <?php endforeach; ?>
            <?php if (!$recentMovies): ?><tr><td colspan="4" class="muted">No movies yet.</td></tr><?php endif; ?>
            </tbody>
        </table>
        </div>
        <div class="mt-2"><a href="index.php?page=movies" class="btn btn-outline btn-sm">View all movies <i class="fa-solid fa-arrow-right"></i></a></div>
    </div>
</div>
