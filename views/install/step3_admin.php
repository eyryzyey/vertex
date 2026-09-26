<?php $adm = $install['admin'] ?? ['admin_email' => '', 'admin_password' => '']; ?>
<form method="POST" action="install.php?step=3">
    <div class="form-group">
        <label class="form-label">Admin Email</label>
        <input type="email" name="admin_email" id="admin_email" class="form-control" value="<?= e($adm['admin_email']) ?>" required>
    </div>
    <div class="form-group">
        <label class="form-label">Admin Password (min 6 characters)</label>
        <input type="password" name="admin_password" id="admin_password" class="form-control" required minlength="6">
        <div class="strength"><div class="s-bar" id="sBar"></div></div>
        <div class="hint" id="sHint">Password strength</div>
    </div>

    <div class="nav-row">
        <a href="install.php?step=2" class="btn btn-outline"><i class="fa-solid fa-arrow-left"></i> Back</a>
        <button type="submit" class="btn btn-primary">Next <i class="fa-solid fa-arrow-right"></i></button>
    </div>
</form>

<script>
document.getElementById('admin_password').addEventListener('input', function () {
    const v = this.value;
    let s = 0;
    if (v.length >= 6) s++;
    if (v.length >= 10) s++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
    if (/\d/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    const pct = Math.min(100, s * 20);
    const colors = ['#EF4444', '#F59E0B', '#F59E0B', '#10B981', '#10B981'];
    const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
    document.getElementById('sBar').style.width = pct + '%';
    document.getElementById('sBar').style.background = colors[Math.max(0, s - 1)] || '#EF4444';
    document.getElementById('sHint').textContent = 'Password strength: ' + (labels[Math.max(0, s - 1)] || 'Very weak');
});
</script>
