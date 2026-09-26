<?php
$page = $_GET['page'] ?? 'dashboard';
?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= e(AppSetting::get('app_name', 'StreamVault')) ?> — Admin</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<style>
:root{
    --sky-50:#F0F9FF;--sky-100:#E0F2FE;--sky-200:#BAE6FD;--sky-300:#7DD3FC;
    --sky-400:#38BDF8;--sky-500:#0EA5E9;--sky-600:#0284C7;--sky-700:#0369A1;
    --bg-body:#F0F4F8;--bg-card:rgba(255,255,255,0.72);--bg-card-solid:#FFFFFF;
    --glass-blur:blur(14px);--glass-border:rgba(255,255,255,0.6);
    --text-primary:#1E293B;--text-secondary:#475569;--text-muted:#94A3B8;
    --success:#10B981;--success-bg:#D1FAE5;--danger:#EF4444;--danger-bg:#FEE2E2;
    --warning:#F59E0B;--warning-bg:#FEF3C7;--info:#3B82F6;--info-bg:#DBEAFE;
    --purple:#7C3AED;--purple-bg:#EDE9FE;
    --gradient-side:linear-gradient(160deg,#0EA5E9 0%,#0277BD 50%,#01579B 100%);
    --gradient-btn:linear-gradient(135deg,#38BDF8,#0284C7);
    --gradient-btn-h:linear-gradient(135deg,#0EA5E9,#0369A1);
    --border:#E2E8F0;--border-focus:#38BDF8;
    --sidebar-w:260px;--topbar-h:64px;--radius:14px;--radius-sm:10px;--radius-xs:6px;
    --shadow-card:0 2px 16px rgba(14,165,233,0.06),0 1px 4px rgba(0,0,0,0.04);
    --shadow-md:0 4px 20px rgba(0,0,0,0.08);--shadow-lg:0 12px 40px rgba(0,0,0,0.12);
    --ease:cubic-bezier(0.4,0,0.2,1);
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',system-ui,sans-serif;background:var(--bg-body);color:var(--text-primary);min-height:100vh;
    background-image:radial-gradient(ellipse at 10% 20%,rgba(186,230,253,0.3) 0%,transparent 50%),
    radial-gradient(ellipse at 80% 80%,rgba(186,230,253,0.2) 0%,transparent 50%)}
a{text-decoration:none;color:var(--sky-600)}
::-webkit-scrollbar{width:8px;height:8px}
::-webkit-scrollbar-thumb{background:var(--sky-200);border-radius:8px}

/* Layout */
.dashboard-wrapper{display:flex;min-height:100vh}
.sidebar{width:var(--sidebar-w);position:fixed;top:0;left:0;bottom:0;background:var(--gradient-side);color:#fff;
    display:flex;flex-direction:column;z-index:100;transition:transform .3s var(--ease)}
.sidebar-brand{display:flex;align-items:center;gap:12px;padding:20px 22px;font-size:1.25rem;font-weight:800;letter-spacing:.3px}
.sidebar-brand i{font-size:1.4rem;animation:logoPulse 3s ease-in-out infinite}
.sidebar-nav{flex:1;padding:12px 14px;overflow-y:auto}
.sidebar-nav .nav-section{font-size:.68rem;text-transform:uppercase;letter-spacing:1.5px;opacity:.6;padding:16px 12px 8px}
.sidebar-nav a{display:flex;align-items:center;gap:12px;color:rgba(255,255,255,.85);padding:11px 14px;border-radius:var(--radius-sm);
    font-size:.92rem;font-weight:500;margin-bottom:4px;transition:all .25s var(--ease)}
.sidebar-nav a i{width:20px;text-align:center}
.sidebar-nav a:hover{background:rgba(255,255,255,.12);color:#fff;transform:translateX(3px)}
.sidebar-nav a.active{background:rgba(255,255,255,.18);color:#fff;box-shadow:inset 3px 0 0 var(--sky-300)}
.sidebar-footer{padding:16px 22px;font-size:.75rem;opacity:.65;border-top:1px solid rgba(255,255,255,.15)}

.main-area{flex:1;margin-left:var(--sidebar-w);display:flex;flex-direction:column;min-width:0}
.topbar{height:var(--topbar-h);position:sticky;top:0;z-index:90;display:flex;align-items:center;gap:16px;padding:0 24px;
    background:rgba(255,255,255,.7);backdrop-filter:var(--glass-blur);-webkit-backdrop-filter:var(--glass-blur);
    border-bottom:1px solid var(--glass-border)}
.topbar .search-box{flex:1;max-width:420px;position:relative}
.topbar .search-box i{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--text-muted);font-size:.85rem}
.topbar .search-box input{width:100%;padding:10px 14px 10px 40px;border:1px solid var(--border);border-radius:999px;
    background:var(--bg-card);font-family:inherit;font-size:.88rem;outline:none;transition:border .2s}
.topbar .search-box input:focus{border-color:var(--border-focus);box-shadow:0 0 0 3px rgba(56,189,248,.15)}
.topbar .spacer{flex:1}
.icon-btn{width:38px;height:38px;border-radius:50%;border:1px solid var(--border);background:var(--bg-card);cursor:pointer;
    color:var(--text-secondary);display:grid;place-items:center;transition:all .2s;position:relative}
.icon-btn:hover{border-color:var(--sky-300);color:var(--sky-500)}
.icon-btn .dot{position:absolute;top:8px;right:9px;width:8px;height:8px;border-radius:50%;background:var(--danger)}
.admin-chip{display:flex;align-items:center;gap:10px;padding:6px 6px 6px 14px;border:1px solid var(--border);
    border-radius:999px;background:var(--bg-card)}
.admin-chip .avatar{width:32px;height:32px;border-radius:50%;background:var(--gradient-btn);color:#fff;display:grid;place-items:center;font-weight:700;font-size:.85rem}
.admin-chip .info{display:flex;flex-direction:column;line-height:1.15}
.admin-chip .info b{font-size:.83rem}
.admin-chip .info span{font-size:.7rem;color:var(--text-muted)}

.page-content{padding:28px;flex:1}
.page-header{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;margin-bottom:24px}
.page-header h1{font-size:1.45rem;font-weight:800}
.breadcrumb{font-size:.8rem;color:var(--text-muted);margin-top:4px}
.breadcrumb a{color:var(--text-muted)}
.menu-toggle{display:none}

/* Cards */
.card{background:var(--bg-card);backdrop-filter:var(--glass-blur);-webkit-backdrop-filter:var(--glass-blur);
    border:1px solid var(--glass-border);border-radius:var(--radius);box-shadow:var(--shadow-card)}
.card-pad{padding:22px}
.card-title{font-size:1rem;font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:10px}
.card-title i{color:var(--sky-500)}

/* Stat cards */
.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;margin-bottom:24px}
.stat-card{display:flex;align-items:center;gap:16px;padding:20px;transition:transform .25s var(--ease),box-shadow .25s var(--ease)}
.stat-card:hover{transform:translateY(-4px);box-shadow:var(--shadow-md)}
.stat-icon{width:54px;height:54px;border-radius:var(--radius-sm);display:grid;place-items:center;font-size:1.3rem;flex-shrink:0}
.stat-icon.sky{background:var(--sky-100);color:var(--sky-500)}
.stat-icon.green{background:var(--success-bg);color:var(--success)}
.stat-icon.orange{background:var(--warning-bg);color:var(--warning)}
.stat-icon.purple{background:var(--purple-bg);color:var(--purple)}
.stat-body h3{font-size:.8rem;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.6px}
.stat-body .num{font-size:1.7rem;font-weight:800;margin:2px 0}
.stat-body .trend{font-size:.72rem;font-weight:600;color:var(--success)}

/* Tables */
.table-wrap{overflow-x:auto}
.table{width:100%;border-collapse:collapse;font-size:.88rem}
.table th{text-align:left;padding:12px 14px;color:var(--text-secondary);font-weight:600;font-size:.75rem;
    text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid var(--border)}
.table td{padding:13px 14px;border-bottom:1px solid var(--border);vertical-align:middle}
.table tbody tr{transition:background .2s}
.table tbody tr:hover{background:var(--sky-50)}
.thumb{width:44px;height:44px;object-fit:cover;border-radius:var(--radius-xs);border:1px solid var(--border);background:var(--sky-50)}
.thumb-ph{width:44px;height:44px;border-radius:var(--radius-xs);display:grid;place-items:center;background:var(--sky-100);color:var(--sky-500)}

/* Badges */
.badge{display:inline-block;padding:4px 11px;border-radius:999px;font-size:.72rem;font-weight:600}
.badge-success{background:var(--success-bg);color:var(--success)}
.badge-danger{background:var(--danger-bg);color:var(--danger)}
.badge-warning{background:var(--warning-bg);color:var(--warning)}
.badge-info{background:var(--info-bg);color:var(--info)}
.badge-purple{background:var(--purple-bg);color:var(--purple)}

/* Buttons */
.btn{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:var(--radius-sm);font-size:.88rem;
    font-weight:600;cursor:pointer;border:1px solid transparent;font-family:inherit;transition:all .2s var(--ease)}
.btn-primary{background:var(--gradient-btn);color:#fff;box-shadow:0 4px 14px rgba(14,165,233,.3)}
.btn-primary:hover{background:var(--gradient-btn-h);transform:translateY(-1px);box-shadow:0 6px 18px rgba(14,165,233,.4)}
.btn-outline{background:var(--bg-card);border-color:var(--border);color:var(--text-secondary)}
.btn-outline:hover{border-color:var(--sky-300);color:var(--sky-500)}
.btn-danger-soft{background:var(--danger-bg);color:var(--danger)}
.btn-danger-soft:hover{background:var(--danger);color:#fff}
.btn-sm{padding:6px 12px;font-size:.78rem}
.btn i{font-size:.8em}

/* Forms */
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.form-grid .full{grid-column:1/-1}
.form-group{margin-bottom:4px}
.form-label{display:block;font-size:.82rem;font-weight:600;color:var(--text-secondary);margin-bottom:7px}
.form-control{width:100%;padding:11px 14px;border:1px solid var(--border);border-radius:var(--radius-sm);
    background:#fff;font-family:inherit;font-size:.9rem;color:var(--text-primary);outline:none;transition:all .2s}
.form-control:focus{border-color:var(--border-focus);box-shadow:0 0 0 3px rgba(56,189,248,.15)}
textarea.form-control{resize:vertical;min-height:100px}
select.form-control{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 16 16'%3E%3Cpath fill='%2394A3B8' d='M8 11L3 6h10z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center}
.input-icon{position:relative}
.input-icon i{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--text-muted);font-size:.85rem}
.input-icon .form-control{padding-left:40px}

/* Toggle switch */
.switch{position:relative;display:inline-block;width:46px;height:25px;flex-shrink:0}
.switch input{opacity:0;width:0;height:0}
.switch .slider{position:absolute;inset:0;background:#CBD5E1;border-radius:999px;cursor:pointer;transition:.25s}
.switch .slider:before{content:'';position:absolute;width:19px;height:19px;border-radius:50%;background:#fff;top:3px;left:3px;transition:.25s;box-shadow:0 1px 3px rgba(0,0,0,.25)}
.switch input:checked + .slider{background:var(--sky-500)}
.switch input:checked + .slider:before{transform:translateX(21px)}
.toggle-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 0;border-bottom:1px solid var(--border)}
.toggle-row:last-child{border-bottom:0}
.toggle-row .t-label b{display:block;font-size:.9rem}
.toggle-row .t-label span{font-size:.78rem;color:var(--text-muted)}

/* Alerts */
.alert{display:flex;align-items:center;gap:10px;padding:13px 18px;border-radius:var(--radius-sm);font-size:.88rem;font-weight:500;margin-bottom:20px}
.alert-success{background:var(--success-bg);color:var(--success);animation:slideDown .3s var(--ease)}
.alert-danger{background:var(--danger-bg);color:var(--danger);animation:slideDown .3s var(--ease)}
.alert-warning{background:var(--warning-bg);color:var(--warning);animation:slideDown .3s var(--ease)}

/* File upload */
.file-drop{border:2px dashed var(--sky-300);border-radius:var(--radius-sm);background:var(--sky-50);padding:26px;
    text-align:center;cursor:pointer;transition:all .2s;color:var(--text-secondary)}
.file-drop:hover{border-color:var(--sky-500);background:var(--sky-100)}
.file-drop i{font-size:1.6rem;color:var(--sky-400);margin-bottom:8px;display:block}
.file-drop input{display:none}

/* Ad network selector */
.net-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:22px}
.net-card{padding:20px;text-align:center;cursor:pointer;transition:all .25s var(--ease);border:2px solid transparent}
.net-card:hover{transform:translateY(-3px);box-shadow:var(--shadow-md)}
.net-card.selected{border-color:var(--sky-400);background:var(--sky-50)}
.net-card i{font-size:1.8rem;margin-bottom:10px;display:block}
.net-card .n-admob{color:#EA4335}.net-card .n-applovin{color:#5B6CFF}
.net-card .n-startapp{color:#10B981}.net-card .n-unity{color:#111827}
.net-card b{display:block;font-size:.95rem}
.net-card span{font-size:.75rem;color:var(--text-muted)}

/* Misc */
.empty-state{text-align:center;padding:50px 20px;color:var(--text-muted)}
.empty-state i{font-size:2.4rem;margin-bottom:12px;color:var(--sky-200);display:block}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.actions{display:flex;gap:8px}
.muted{color:var(--text-muted);font-size:.8rem}
.mt-2{margin-top:16px}.mb-2{margin-bottom:16px}
.danger-zone{border:1px solid #FECACA;background:rgba(254,226,226,.4)}
.danger-zone .card-title i{color:var(--danger)}

/* Animations */
@keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.fadeIn,.form-group.fadeIn{animation:fadeIn .3s var(--ease)}

@media (max-width:992px){
    .sidebar{transform:translateX(-100%)}
    .sidebar.open{transform:translateX(0)}
    .main-area{margin-left:0}
    .grid-2,.form-grid{grid-template-columns:1fr}
    .menu-toggle{display:grid}
}
</style>
</head>
<body>
<div class="dashboard-wrapper">
