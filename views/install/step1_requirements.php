<?php
$reqs = InstallController::requirements();
$allOk = InstallController::allRequirementsOk();
ob_start();
?>
<div class="req-list">
    <?php foreach ($reqs as $r): ?>
        <div class="req-item">
            <i class="fa-solid <?= $r['ok'] ? 'fa-circle-check ok' : 'fa-circle-xmark fail' ?>"></i>
            <span><?= e($r['label']) ?></span>
            <span class="val"><?= e($r['value']) ?></span>
        </div>
    <?php endforeach; ?>
</div>

<?php if (!$allOk): ?>
    <div class="alert alert-error show"><i class="fa-solid fa-triangle-exclamation"></i> Please fix the failed requirements above before continuing.</div>
<?php endif; ?>

<form method="POST" action="install.php?step=1">
    <div class="nav-row">
        <span class="hint">Step 1 of 4 &mdash; Server requirements</span>
        <button type="submit" class="btn btn-primary" <?= $allOk ? '' : 'disabled' ?>>Next <i class="fa-solid fa-arrow-right"></i></button>
    </div>
</form>
<?php
$content = ob_get_clean();
install_render(1, $content);
