<?php $db = $install['db'] ?? ['db_host' => 'localhost', 'db_name' => 'streaming_db', 'db_user' => 'root', 'db_pass' => '']; ?>
<div class="alert" id="alert"></div>

<form method="POST" action="install.php?step=2" id="dbForm">
    <div class="form-group">
        <label class="form-label">Database Host</label>
        <input type="text" name="db_host" id="db_host" class="form-control" value="<?= e($db['db_host']) ?>" required>
    </div>
    <div class="form-group">
        <label class="form-label">Database Name</label>
        <input type="text" name="db_name" id="db_name" class="form-control" value="<?= e($db['db_name']) ?>" required>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
        <div class="form-group">
            <label class="form-label">Username</label>
            <input type="text" name="db_user" id="db_user" class="form-control" value="<?= e($db['db_user']) ?>" required>
        </div>
        <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" name="db_pass" id="db_pass" class="form-control" value="<?= e($db['db_pass']) ?>">
        </div>
    </div>

    <div class="nav-row">
        <a href="install.php?step=1" class="btn btn-outline"><i class="fa-solid fa-arrow-left"></i> Back</a>
        <div style="display:flex;gap:10px">
            <button type="button" class="btn btn-outline" id="testBtn"><i class="fa-solid fa-plug"></i> Test Connection</button>
            <button type="submit" class="btn btn-primary">Next <i class="fa-solid fa-arrow-right"></i></button>
        </div>
    </div>
</form>

<script>
const alertBox = document.getElementById('alert');
function showAlert(ok, msg) {
    alertBox.className = 'alert show ' + (ok ? 'alert-success' : 'alert-error');
    alertBox.innerHTML = '<i class="fa-solid ' + (ok ? 'fa-circle-check' : 'fa-circle-exclamation') + '"></i> ' + msg;
}
document.getElementById('testBtn').addEventListener('click', async () => {
    const btn = document.getElementById('testBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner spin"></i> Testing...';
    try {
        const body = new URLSearchParams({
            db_host: document.getElementById('db_host').value,
            db_user: document.getElementById('db_user').value,
            db_pass: document.getElementById('db_pass').value,
        });
        const res = await fetch('install.php?ajax=test-db', { method: 'POST', body });
        const json = await res.json();
        showAlert(json.status === 'success', json.message);
    } catch (e) {
        showAlert(false, 'Request failed — check your network/PHP setup.');
    }
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-plug"></i> Test Connection';
});
</script>
