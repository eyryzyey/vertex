</div><!-- /.main-area -->
</div><!-- /.dashboard-wrapper -->
<script>
// Sidebar toggle (mobile)
const sidebar = document.getElementById('sidebar');
document.getElementById('menuToggle')?.addEventListener('click', () => sidebar.classList.toggle('open'));

// Fullscreen toggle
document.getElementById('fullscreenBtn')?.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
});

// Global search — live filter of table rows
document.getElementById('globalSearch')?.addEventListener('input', function () {
    const q = this.value.toLowerCase();
    document.querySelectorAll('.table tbody tr').forEach(tr => {
        tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
});

// Confirm delete links
document.querySelectorAll('[data-confirm]').forEach(el => {
    el.addEventListener('click', e => {
        if (!confirm(el.dataset.confirm)) e.preventDefault();
    });
});
</script>
</body>
</html>
