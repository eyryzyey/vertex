/* ============ Farjni Panel — dashboard.js ============ */
(() => {
  "use strict";

  /* ---------- Session guard ---------- */
  const session = JSON.parse(localStorage.getItem("farjni_session") || "null");
  if (!session) { window.location.replace("index.html"); return; }

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- User info ---------- */
  $("#userName").textContent = session.username;
  $("#userAvatar").textContent = session.username.charAt(0).toUpperCase();

  /* ---------- Demo data (wire to your PHP API later) ---------- */
  const TYPE_META = {
    channels: { label: "Channel", icon: "bxs-tv", cls: "channel", badge: "channel" },
    movies:   { label: "Movie",   icon: "bxs-film", cls: "movie",  badge: "movie" },
    anime:    { label: "Anime",   icon: "bxs-ghost", cls: "anime",  badge: "anime" },
  };

  let data = {
    channels: [
      { id: 1, title: "BeIN Sports 1", category: "Sports", url: "" },
      { id: 2, title: "Sky News", category: "News", url: "" },
      { id: 3, title: "MBC 1", category: "Entertainment", url: "" },
      { id: 4, title: "SSC Sport", category: "Sports", url: "" },
    ],
    movies: [
      { id: 1, title: "Inception", category: "Sci-Fi", url: "" },
      { id: 2, title: "The Dark Knight", category: "Action", url: "" },
      { id: 3, title: "Interstellar", category: "Sci-Fi", url: "" },
      { id: 4, title: "Joker", category: "Drama", url: "" },
      { id: 5, title: "Dune", category: "Adventure", url: "" },
    ],
    anime: [
      { id: 1, title: "Attack on Titan", category: "Action", url: "" },
      { id: 2, title: "Jujutsu Kaisen", category: "Supernatural", url: "" },
      { id: 3, title: "One Piece", category: "Adventure", url: "" },
    ],
  };
  let filters = { channels: "All", movies: "All", anime: "All" };
  let search = "";
  let nextId = 100;

  /* ---------- Page navigation ---------- */
  const TITLES = { overview: "Overview", channels: "Live Channels", movies: "Movies", anime: "Anime", settings: "Settings" };
  $$(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = btn.dataset.page;
      $$(".nav-item").forEach((b) => b.classList.toggle("active", b === btn));
      $$(".page").forEach((p) => p.classList.toggle("active", p.id === "page-" + page));
      $("#pageTitle").textContent = TITLES[page];
      $("#sidebar").classList.remove("open");
    });
  });
  $("#burgerBtn").addEventListener("click", () => $("#sidebar").classList.toggle("open"));

  /* ---------- Logout ---------- */
  $("#logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("farjni_session");
    window.location.href = "index.html";
  });

  /* ---------- Search ---------- */
  $("#globalSearch").addEventListener("input", (e) => {
    search = e.target.value.trim().toLowerCase();
    renderAll();
  });

  const matches = (item) =>
    !search ||
    item.title.toLowerCase().includes(search) ||
    item.category.toLowerCase().includes(search);

  /* ---------- Render ---------- */
  function renderCounts() {
    $("#countChannels").textContent = data.channels.length;
    $("#countMovies").textContent = data.movies.length;
    $("#countAnime").textContent = data.anime.length;
    $("#statChannels").textContent = data.channels.length;
    $("#statMovies").textContent = data.movies.length;
    $("#statAnime").textContent = data.anime.length;
  }

  function renderChips(type) {
    const cats = ["All", ...new Set(data[type].map((i) => i.category))];
    const box = $("#chips-" + type);
    box.innerHTML = "";
    cats.forEach((cat) => {
      const chip = document.createElement("button");
      chip.className = "chip" + (filters[type] === cat ? " active" : "");
      chip.textContent = cat;
      chip.addEventListener("click", () => { filters[type] = cat; renderAll(); });
      box.appendChild(chip);
    });
  }

  function itemCard(type, item) {
    const meta = TYPE_META[type];
    const card = document.createElement("div");
    card.className = "content-card";
    card.innerHTML = `
      <div class="thumb ${meta.cls}">
        <i class="bx ${meta.icon}"></i>
        ${type === "channels" ? '<span class="live-tag">LIVE</span>' : ""}
      </div>
      <div class="card-body">
        <div class="card-title">${escapeHtml(item.title)}</div>
        <div class="card-sub">${escapeHtml(item.category)}</div>
        <div class="card-actions">
          <button class="icon-btn" title="Play / Preview"><i class="bx bx-play"></i></button>
          <button class="icon-btn" title="Edit"><i class="bx bx-edit"></i></button>
          <button class="icon-btn delete" title="Delete" data-del="${item.id}"><i class="bx bx-trash"></i></button>
        </div>
      </div>`;
    card.querySelector("[data-del]").addEventListener("click", () => {
      data[type] = data[type].filter((i) => i.id !== item.id);
      renderAll();
    });
    return card;
  }

  function renderGrid(type) {
    const grid = $("#grid-" + type);
    grid.innerHTML = "";
    const items = data[type].filter(
      (i) => matches(i) && (filters[type] === "All" || i.category === filters[type])
    );
    if (!items.length) {
      grid.innerHTML = '<div class="empty-state"><i class="bx bx-inbox" style="font-size:34px;display:block;margin-bottom:10px;"></i>No items found</div>';
      return;
    }
    items.forEach((item) => grid.appendChild(itemCard(type, item)));
  }

  function renderRecent() {
    const all = [
      ...data.channels.map((i) => ({ ...i, type: "channels" })),
      ...data.movies.map((i) => ({ ...i, type: "movies" })),
      ...data.anime.map((i) => ({ ...i, type: "anime" })),
    ].filter(matches).slice(0, 8);
    const tbody = $("#recentTable");
    tbody.innerHTML = "";
    if (!all.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:28px;">No results</td></tr>';
      return;
    }
    all.forEach((item) => {
      const meta = TYPE_META[item.type];
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><span class="badge ${meta.badge}">${meta.label}</span></td>
        <td>${escapeHtml(item.title)}</td>
        <td style="color:var(--text-2)">${escapeHtml(item.category)}</td>
        <td><span class="status">Active</span></td>
        <td><button class="icon-btn delete" title="Delete"><i class="bx bx-trash"></i></button></td>`;
      tr.querySelector(".icon-btn").addEventListener("click", () => {
        data[item.type] = data[item.type].filter((i) => i.id !== item.id);
        renderAll();
      });
      tbody.appendChild(tr);
    });
  }

  function renderAll() {
    ["channels", "movies", "anime"].forEach((t) => { renderChips(t); renderGrid(t); });
    renderRecent();
    renderCounts();
  }

  const escapeHtml = (s) =>
    s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Add-item modal ---------- */
  let addType = "channels";
  const backdrop = $("#modalBackdrop");

  $$("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      addType = btn.dataset.add;
      $("#modalTitle").textContent = "Add " + TYPE_META[addType].label;
      $("#itemTitle").value = ""; $("#itemCategory").value = ""; $("#itemUrl").value = "";
      backdrop.classList.add("open");
      setTimeout(() => $("#itemTitle").focus(), 100);
    });
  });
  $("#modalClose").addEventListener("click", () => backdrop.classList.remove("open"));
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) backdrop.classList.remove("open"); });

  $("#modalSave").addEventListener("click", () => {
    const title = $("#itemTitle").value.trim();
    const category = $("#itemCategory").value.trim() || "General";
    if (title.length < 2) { $("#itemTitle").focus(); return; }
    data[addType].unshift({ id: nextId++, title, category, url: $("#itemUrl").value.trim() });
    backdrop.classList.remove("open");
    renderAll();
  });

  /* ---------- Settings ---------- */
  $("#saveSettings").addEventListener("click", () => {
    const msg = $("#settingsMsg");
    msg.textContent = "✅ Settings saved (demo — sync with your API).";
    setTimeout(() => (msg.textContent = ""), 3000);
  });

  $("#refreshBtn").addEventListener("click", renderAll);

  /* ---------- Init ---------- */
  renderAll();
})();
