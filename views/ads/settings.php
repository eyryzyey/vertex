<div class="page-header">
    <div>
        <h1>Ad Networks</h1>
        <div class="breadcrumb"><a href="index.php?page=dashboard">Home</a> / Ad Networks</div>
    </div>
</div>

<div class="net-grid" id="netGrid">
    <?php
    $netMeta = [
        'admob' => ['fa-brands fa-google', 'n-admob', 'Google AdMob'],
        'applovin' => ['fa-solid fa-chart-line', 'n-applovin', 'AppLovin MAX'],
        'startapp' => ['fa-solid fa-rocket', 'n-startapp', 'StartApp'],
        'unity' => ['fa-brands fa-unity', 'n-unity', 'Unity Ads'],
    ];
    foreach ($networks as $net):
        [$icon, $cls, $label] = $netMeta[$net];
        $active = $settings[$net]['is_active'] ?? false;
    ?>
        <div class="card net-card <?= $active ? 'selected' : '' ?>" data-network="<?= $net ?>">
            <i class="fa-solid <?= $icon ?> <?= $cls ?>"></i>
            <b><?= $label ?></b>
            <span><?= $active ? '<span class="badge badge-success">Active</span>' : 'Not configured' ?></span>
        </div>
    <?php endforeach; ?>
</div>

<?php foreach ($networks as $net): ?>
    <?php $s = $settings[$net] ?? ['is_active' => false, 'settings' => []]; ?>
    <div class="card card-pad net-panel mb-2" id="panel-<?= $net ?>" style="display:none;max-width:720px">
        <div class="card-title"><i class="fa-solid fa-rectangle-ad"></i> <?= ucfirst($net) ?> Configuration</div>
        <form method="POST" action="index.php?page=ads&action=save">
            <input type="hidden" name="network" value="<?= $net ?>">
            <div id="fields-<?= $net ?>"></div>
            <div class="toggle-row mt-2">
                <div class="t-label"><b>Activate this network</b><span>Ads from this network will be served in the app</span></div>
                <label class="switch"><input type="checkbox" name="is_active" value="1" <?= $s['is_active'] ? 'checked' : '' ?>><span class="slider"></span></label>
            </div>
            <div class="actions mt-2">
                <button type="submit" class="btn btn-primary"><i class="fa-solid fa-floppy-disk"></i> Save Settings</button>
                <a href="index.php?page=ads&action=delete&network=<?= $net ?>" data-confirm="Clear all <?= ucfirst($net) ?> settings?" class="btn btn-danger-soft"><i class="fa-solid fa-trash"></i> Clear</a>
            </div>
        </form>
    </div>
<?php endforeach; ?>

<script src="assets/js/ads-manager.js"></script>
<script>
const existing = <?= json_encode(array_map(fn($s) => $s['settings'], $settings), JSON_UNESCAPED_UNICODE) ?>;
const cards = document.querySelectorAll('.net-card');
const panels = document.querySelectorAll('.net-panel');

function select(net) {
    cards.forEach(c => c.classList.toggle('selected', c.dataset.network === net));
    panels.forEach(p => p.style.display = p.id === 'panel-' + net ? '' : 'none');
    AdsManager.render(net, 'fields-' + net, existing[net] || {});
}
cards.forEach(c => c.addEventListener('click', () => select(c.dataset.network)));
// Pre-select first network (or the active one)
const pre = document.querySelector('.net-card.selected') || cards[0];
if (pre) select(pre.dataset.network);
</script>
