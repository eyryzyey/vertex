<?php
$db = $install['db'] ?? [];
$adm = $install['admin'] ?? [];
?>
<div id="reviewBox">
    <div class="summary">
        <div class="item"><b>Database Host</b><?= e($db['db_host'] ?? '—') ?></div>
        <div class="item"><b>Database Name</b><?= e($db['db_name'] ?? '—') ?></div>
        <div class="item"><b>DB User</b><?= e($db['db_user'] ?? '—') ?></div>
        <div class="item"><b>Admin Email</b><?= e($adm['admin_email'] ?? '—') ?></div>
    </div>

    <div class="alert" id="alert"></div>
    <div class="progress" id="progress" style="display:none"><div class="bar" id="pBar"></div></div>

    <div class="nav-row">
        <a href="install.php?step=3" class="btn btn-outline"><i class="fa-solid fa-arrow-left"></i> Back</a>
        <button type="button" class="btn btn-primary" id="installBtn"><i class="fa-solid fa-rocket"></i> Install Now</button>
    </div>
</div>

<div id="successBox" style="display:none">
    <div class="success-screen">
        <div class="check"><i class="fa-solid fa-check"></i></div>
        <h2 style="font-size:1.25rem;font-weight:800;margin-bottom:8px">Installation Complete!</h2>
        <p class="hint" style="margin-bottom:22px">Your admin dashboard is ready. Sign in with the account you just created.</p>
        <a href="index.php?page=login" class="btn btn-primary"><i class="fa-solid fa-right-to-bracket"></i> Go to Login</a>
    </div>
</div>

<script>
document.getElementById('installBtn').addEventListener('click', async () => {
    const btn = document.getElementById('installBtn');
    const alertBox = document.getElementById('alert');
    const progress = document.getElementById('progress');
    const pBar = document.getElementById('pBar');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner spin"></i> Installing...';
    progress.style.display = '';
    pBar.style.width = '30%';

    try {
        const body = new URLSearchParams({
            db_host: <?= json_encode($db['db_host'] ?? 'localhost') ?>,
            db_name: <?= json_encode($db['db_name'] ?? 'streaming_db') ?>,
            db_user: <?= json_encode($db['db_user'] ?? 'root') ?>,
            db_pass: <?= json_encode($db['db_pass'] ?? '') ?>,
            admin_email: <?= json_encode($adm['admin_email'] ?? '') ?>,
            admin_password: <?= json_encode($adm['admin_password'] ?? '') ?>,
            app_name: 'StreamVault',
        });
        pBar.style.width = '60%';
        const res = await fetch('install.php?ajax=install', { method: 'POST', body });
        const json = await res.json();
        pBar.style.width = '100%';

        if (json.status === 'success') {
            document.getElementById('reviewBox').style.display = 'none';
            document.getElementById('successBox').style.display = '';
        } else {
            alertBox.className = 'alert alert-error show';
            alertBox.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> ' + json.message;
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-rocket"></i> Install Now';
            progress.style.display = 'none';
        }
    } catch (e) {
        alertBox.className = 'alert alert-error show';
        alertBox.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Request failed.';
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-rocket"></i> Install Now';
        progress.style.display = 'none';
    }
});
</script>
