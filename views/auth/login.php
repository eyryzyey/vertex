<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Login — <?= e(AppSetting::get('app_name', 'StreamVault')) ?></title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<style>
:root{--sky-400:#38BDF8;--sky-500:#0EA5E9;--sky-600:#0284C7;--text-primary:#1E293B;--text-secondary:#475569;--text-muted:#94A3B8}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',system-ui,sans-serif;min-height:100vh;display:grid;place-items:center;
    background:linear-gradient(135deg,#E0F2FE 0%,#F0F9FF 45%,#BAE6FD 100%);overflow:hidden;position:relative}
.orb{position:absolute;border-radius:50%;filter:blur(70px);opacity:.55;animation:float 8s ease-in-out infinite}
.orb1{width:380px;height:380px;background:#7DD3FC;top:-100px;left:-80px}
.orb2{width:320px;height:320px;background:#38BDF8;bottom:-90px;right:-60px;animation-delay:-4s}
.orb3{width:200px;height:200px;background:#E0F2FE;top:55%;left:12%;animation-delay:-2s}
@keyframes float{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-28px) scale(1.06)}}
.login-card{position:relative;z-index:2;width:100%;max-width:410px;margin:20px;background:rgba(255,255,255,.68);
    backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.7);
    border-radius:22px;box-shadow:0 24px 60px rgba(2,119,189,.18);padding:40px 36px;animation:cardSlideUp .6s cubic-bezier(.4,0,.2,1)}
@keyframes cardSlideUp{from{opacity:0;transform:translateY(34px)}to{opacity:1;transform:translateY(0)}}
.brand{display:flex;flex-direction:column;align-items:center;gap:12px;margin-bottom:28px}
.brand .logo{width:64px;height:64px;border-radius:18px;background:linear-gradient(135deg,#38BDF8,#0284C7);display:grid;place-items:center;
    color:#fff;font-size:1.7rem;box-shadow:0 10px 24px rgba(14,165,233,.4);animation:logoPulse 3s ease-in-out infinite}
@keyframes logoPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
.brand h1{font-size:1.45rem;font-weight:800;color:var(--text-primary)}
.brand p{font-size:.83rem;color:var(--text-muted)}
.field{position:relative;margin-bottom:16px}
.field i{position:absolute;left:16px;top:50%;transform:translateY(-50%);color:var(--text-muted);font-size:.9rem}
.field input{width:100%;padding:13px 44px;border:1px solid #E2E8F0;border-radius:12px;background:rgba(255,255,255,.9);
    font-family:inherit;font-size:.92rem;outline:none;transition:all .2s;color:var(--text-primary)}
.field input:focus{border-color:var(--sky-400);box-shadow:0 0 0 4px rgba(56,189,248,.15)}
.eye{position:absolute;right:14px;top:50%;transform:translateY(-50%);cursor:pointer;color:var(--text-muted);background:none;border:0;font-size:.95rem}
.btn-login{width:100%;padding:14px;border:0;border-radius:12px;background:linear-gradient(135deg,#38BDF8,#0284C7);
    color:#fff;font-family:inherit;font-size:.95rem;font-weight:700;cursor:pointer;transition:all .25s;box-shadow:0 8px 20px rgba(14,165,233,.35)}
.btn-login:hover{background:linear-gradient(135deg,#0EA5E9,#0369A1);transform:translateY(-2px)}
.error{display:flex;align-items:center;gap:9px;background:#FEE2E2;color:#EF4444;padding:12px 15px;border-radius:11px;
    font-size:.84rem;font-weight:500;margin-bottom:16px;animation:shakeError .4s}
@keyframes shakeError{0%,100%{transform:translateX(0)}25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}
@media(max-width:480px){.login-card{padding:32px 24px}}
</style>
</head>
<body>
<div class="orb orb1"></div><div class="orb orb2"></div><div class="orb orb3"></div>

<div class="login-card">
    <div class="brand">
        <div class="logo"><i class="fa-solid fa-clapperboard"></i></div>
        <h1><?= e(AppSetting::get('app_name', 'StreamVault')) ?></h1>
        <p>Sign in to the admin dashboard</p>
    </div>

    <?php if ($error): ?>
        <div class="error"><i class="fa-solid fa-circle-exclamation"></i> <?= e($error) ?></div>
    <?php endif; ?>

    <form method="POST" action="index.php?page=login" autocomplete="off">
        <div class="field">
            <i class="fa-solid fa-envelope"></i>
            <input type="email" name="email" placeholder="Email address" required value="<?= e($_POST['email'] ?? '') ?>">
        </div>
        <div class="field">
            <i class="fa-solid fa-lock"></i>
            <input type="password" name="password" id="pwd" placeholder="Password" required>
            <button type="button" class="eye" id="togglePwd"><i class="fa-regular fa-eye"></i></button>
        </div>
        <button type="submit" class="btn-login"><i class="fa-solid fa-right-to-bracket"></i> Sign In</button>
    </form>
</div>

<script>
document.getElementById('togglePwd').addEventListener('click', function () {
    const p = document.getElementById('pwd');
    const show = p.type === 'password';
    p.type = show ? 'text' : 'password';
    this.innerHTML = show ? '<i class="fa-regular fa-eye-slash"></i>' : '<i class="fa-regular fa-eye"></i>';
});
</script>
</body>
</html>
