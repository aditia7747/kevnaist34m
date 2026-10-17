(function () {
  "use strict";

  const DIRECT_BASE = "https://api.iroha-api.web.id";
  const FALLBACK_KEY = "iroha_267d3ed4b6d2afa34b83e7aa6747ee35bd29c9d7eea10cd6";

  let currentMode = "anime"; // 'anime' | 'donghua'
  let currentSubTab = "home";
  let hlsInstance = null;

  function escapeHTML(str) {
    if (str === null || str === undefined) return "";
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  // Proxy Gambar Bawaan Iroha (/v1/anime/streaming/img?u=) agar Poster Selalu Tampil
  function getPosterUrl(rawUrl, titleFallback) {
    const code = encodeURIComponent((titleFallback || "KS").slice(0, 2).toUpperCase());
    const fallback = `https://ui-avatars.com/api/?name=${code}&background=131c36&color=00e5ff&size=400&bold=true`;
    if (!rawUrl || typeof rawUrl !== "string") return fallback;
    if (rawUrl.startsWith("/")) rawUrl = DIRECT_BASE + rawUrl;
    if (rawUrl.includes("/v1/anime/streaming/img")) {
      return rawUrl.includes("apikey=") ? rawUrl : `${rawUrl}&apikey=${FALLBACK_KEY}`;
    }
    return `${DIRECT_BASE}/v1/anime/streaming/img?u=${encodeURIComponent(rawUrl)}&apikey=${FALLBACK_KEY}`;
  }

  // Dual-Mode Fetcher: Utamakan Serverless Vercel (/api/iroha), Fallback ke Direct untuk Localhost
  async function irohaFetch(path) {
    try {
      const proxyRes = await fetch(`/api/iroha?path=${encodeURIComponent(path)}`);
      const cType = proxyRes.headers.get("content-type") || "";
      if (proxyRes.ok && cType.includes("json")) {
        return await proxyRes.json();
      }
    } catch (e) {}

    const sep = path.includes("?") ? "&" : "?";
    const directUrl = `${DIRECT_BASE}${path}${sep}apikey=${FALLBACK_KEY}`;
    const res = await fetch(directUrl, {
      headers: { "X-API-Key": FALLBACK_KEY }
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  }

  // Suntikkan Desain 3D Tactile KevnaiStream
  function injectStyles() {
    document.head.insertAdjacentHTML(
      "beforeend",
      `<link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
      <style>
        :root {
          --bg-base: #060913;
          --bg-card: #0d1428;
          --primary: #00e5ff;
          --secondary: #6366f1;
          --btn-depth: #007a99;
          --text-main: #f8fafc;
          --text-sub: #94a3b8;
          --border-accent: rgba(0, 229, 255, 0.28);
          --glow: rgba(0, 229, 255, 0.16);
        }
        [data-theme="gold"] {
          --primary: #fbbf24;
          --secondary: #f59e0b;
          --btn-depth: #92400e;
          --border-accent: rgba(251, 191, 36, 0.32);
          --glow: rgba(251, 191, 36, 0.16);
        }
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background-color: var(--bg-base);
          color: var(--text-main);
          min-height: 100vh;
          overflow-x: hidden;
          background-image:
            radial-gradient(circle at 15% 10%, var(--glow), transparent 40%),
            radial-gradient(circle at 85% 90%, rgba(99,102,241,0.12), transparent 40%),
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 100% 100%, 100% 100%, 36px 36px, 36px 36px;
        }
        .wrap { max-width: 1000px; margin: 0 auto; padding: 14px 14px 60px; }

        .top-bar {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 16px; margin-bottom: 16px;
          background: linear-gradient(180deg, #16203d, #0b1122);
          border: 1px solid var(--border-accent); border-radius: 16px;
          box-shadow: 0 6px 0 #03050b;
        }
        .theme-dots { display: flex; gap: 10px; align-items: center; }
        .theme-dot {
          width: 22px; height: 22px; border-radius: 50%; cursor: pointer;
          border: 2px solid rgba(255,255,255,0.3);
        }
        .theme-dot.active { border-color: #fff; transform: scale(1.15); box-shadow: 0 0 12px var(--primary); }

        .header-3d {
          background: linear-gradient(180deg, #16203d, #0b1122);
          border: 1px solid var(--border-accent); border-radius: 22px;
          padding: 18px; margin-bottom: 18px;
          box-shadow: 0 10px 0 #03050b, 0 20px 35px rgba(0,0,0,0.65);
        }
        .brand-row {
          display: flex; justify-content: space-between; align-items: center;
          gap: 12px; margin-bottom: 14px; flex-wrap: wrap;
        }
        .brand-title {
          font-family: 'Outfit', sans-serif; font-size: clamp(24px, 6vw, 30px);
          font-weight: 800; cursor: pointer;
          background: linear-gradient(90deg, #fff, var(--primary));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .mode-switch {
          display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
          background: #060913; padding: 5px; border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.08); margin-bottom: 14px;
        }
        .mode-btn {
          border: none; background: transparent; color: var(--text-sub);
          font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 800;
          padding: 11px; border-radius: 10px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: 0.2s;
        }
        .mode-btn.active {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: #040711; box-shadow: 0 4px 0 var(--btn-depth);
        }

        .search-row { display: grid; grid-template-columns: 1fr auto; gap: 8px; }
        .input-3d {
          width: 100%; padding: 12px 15px; border-radius: 13px;
          background: #050812; border: 1.5px solid rgba(255,255,255,0.14);
          color: #fff; font-size: 13.5px; outline: none;
          box-shadow: inset 0 3px 6px rgba(0,0,0,0.75);
        }
        .input-3d:focus { border-color: var(--primary); }

        .btn-3d {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: #040711; border: none; padding: 11px 16px; border-radius: 13px;
          font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 13.5px;
          cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 7px;
          box-shadow: 0 5px 0 var(--btn-depth), 0 8px 16px rgba(0,0,0,0.4);
          transition: transform 0.12s, box-shadow 0.12s;
        }
        .btn-3d:active { transform: translateY(3px); box-shadow: 0 2px 0 var(--btn-depth); }
        .btn-3d.sec {
          background: linear-gradient(180deg, #1e294b, #11182f); color: #f8fafc;
          border: 1px solid rgba(255,255,255,0.14); box-shadow: 0 4px 0 #050811;
        }
        .btn-3d.sec.active, .btn-3d.sec:hover { border-color: var(--primary); color: var(--primary); }
        .btn-3d.sm { padding: 8px 12px; font-size: 12px; border-radius: 10px; }

        .sub-nav {
          display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; margin-bottom: 16px;
        }
        .sub-nav::-webkit-scrollbar { display: none; }

        .media-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(145px, 1fr)); gap: 14px;
        }
        @media (max-width: 420px) {
          .media-grid { grid-template-columns: repeat(2, 1fr); gap: 11px; }
        }
        .card-3d {
          background: linear-gradient(180deg, #131c36, #0a0f1f);
          border: 1px solid var(--border-accent); border-radius: 16px;
          overflow: hidden; cursor: pointer; display: flex; flex-direction: column;
          box-shadow: 0 7px 0 #04060d, 0 12px 24px rgba(0,0,0,0.55);
          transition: transform 0.18s ease, border-color 0.2s;
        }
        .card-3d:hover { transform: translateY(-4px); border-color: var(--primary); }
        .card-thumb { position: relative; width: 100%; aspect-ratio: 3 / 4.2; background: #050811; }
        .card-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .card-ep {
          position: absolute; top: 8px; left: 8px;
          background: rgba(6,9,19,0.9); border: 1px solid var(--border-accent);
          color: var(--primary); font-size: 10px; font-weight: 800;
          padding: 3px 8px; border-radius: 7px;
        }
        .card-body { padding: 10px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
        .card-title {
          font-size: 13px; font-weight: 700; color: #fff; line-height: 1.38;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }

        .panel-3d {
          background: linear-gradient(165deg, #141d38, #090e1d);
          border: 1.5px solid var(--border-accent); border-radius: 22px;
          padding: 18px; margin-bottom: 20px;
          box-shadow: 0 10px 0 #03050b, 0 20px 38px rgba(0,0,0,0.65);
        }
        .detail-layout { display: grid; grid-template-columns: 170px 1fr; gap: 18px; }
        @media (max-width: 580px) {
          .detail-layout { grid-template-columns: 1fr; text-align: center; }
          .detail-poster { max-width: 165px; margin: 0 auto; }
        }
        .detail-poster {
          width: 100%; aspect-ratio: 3 / 4.2; border-radius: 14px;
          overflow: hidden; border: 2px solid var(--primary);
        }
        .detail-poster img { width: 100%; height: 100%; object-fit: cover; }

        .ep-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 9px; max-height: 420px; overflow-y: auto; margin-top: 12px; padding-right: 4px;
        }
        .ep-btn {
          background: #0d1428; border: 1px solid rgba(255,255,255,0.1);
          color: #e2e8f0; padding: 10px 12px; border-radius: 11px;
          font-size: 12.5px; font-weight: 700; cursor: pointer; text-align: left;
          box-shadow: 0 3px 0 #04060d; transition: 0.15s;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .ep-btn:hover { border-color: var(--primary); color: var(--primary); }

        .player-stage {
          width: 100%; aspect-ratio: 16 / 9; background: #000;
          border-radius: 16px; overflow: hidden; margin: 12px 0;
          border: 1.5px solid var(--border-accent);
          box-shadow: 0 10px 30px rgba(0,0,0,0.75);
        }
        .player-stage video, .player-stage iframe {
          width: 100%; height: 100%; border: none; display: block;
        }
        .server-bar { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }

        .state-box {
          background: var(--bg-card); border: 1px solid var(--border-accent);
          border-radius: 18px; padding: 34px 18px; text-align: center; margin: 16px 0;
          box-shadow: 0 8px 0 #04060d;
        }
        .spinner {
          width: 36px; height: 36px; border: 3px solid rgba(255,255,255,0.12);
          border-top-color: var(--primary); border-radius: 50%;
          animation: spin 0.75s linear infinite; margin: 0 auto 12px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .footer-3d {
          margin-top: 34px; text-align: center; padding: 16px;
          border-radius: 18px; background: linear-gradient(180deg, #131c36, #0a0f1d);
          border: 1px solid var(--border-accent); box-shadow: 0 6px 0 #03050b;
          font-size: 12.5px; color: var(--text-sub);
        }
        .footer-3d strong { color: var(--primary); }
      </style>`
    );
  }

  function renderShell() {
    const app = document.getElementById("app");
    app.innerHTML = `
      <div class="wrap">
        <div class="top-bar">
          <span style="font-size:12px; font-weight:700; color:#34d399;">
            <i class="fa-solid fa-bolt"></i> IrohaStream Engine • Sub Indo
          </span>
          <div class="theme-dots">
            <div class="theme-dot active" id="dotCyan" style="background:#00e5ff;" onclick="setTheme('cyan')"></div>
            <div class="theme-dot" id="dotGold" style="background:#fbbf24;" onclick="setTheme('gold')"></div>
            <button class="btn-3d sec sm" onclick="toggleFullScreen()"><i class="fa-solid fa-expand"></i></button>
          </div>
        </div>

        <header class="header-3d">
          <div class="brand-row">
            <div class="brand-title" onclick="loadSection('home')">
              <i class="fa-solid fa-circle-play" style="-webkit-text-fill-color:var(--primary);"></i> KevnaiStream
            </div>
            <span style="font-size:12px; color:var(--text-sub);">Anime & Donghua 3D Tanpa Iklan</span>
          </div>

          <div class="mode-switch">
            <button class="mode-btn active" id="modeAnimeBtn" onclick="switchMode('anime')">
              <i class="fa-solid fa-tv"></i> Anime Sub Indo
            </button>
            <button class="mode-btn" id="modeDonghuaBtn" onclick="switchMode('donghua')">
              <i class="fa-solid fa-dragon"></i> Donghua 3D
            </button>
          </div>

          <form class="search-row" onsubmit="handleSearch(event)">
            <input type="text" id="searchInput" class="input-3d" placeholder="Cari judul Anime atau Donghua (contoh: one piece, soul land)..." autocomplete="off">
            <button type="submit" class="btn-3d"><i class="fa-solid fa-magnifying-glass"></i> Cari</button>
          </form>
        </header>

        <nav class="sub-nav" id="subNavBar"></nav>
        <main id="mainContent"></main>

        <footer class="footer-3d">
          <i class="fa-solid fa-crown" style="color:#fbbf24;"></i>
          Powered by Iroha Gateway — Developer <strong>KevnAI</strong>
        </footer>
      </div>
    `;
    renderSubNav();
  }

  function renderSubNav() {
    const nav = document.getElementById("subNavBar");
    if (!nav) return;
    const tabs = currentMode === "anime"
      ? [
          { id: "home", label: "Beranda", icon: "fa-house" },
          { id: "ongoing", label: "Ongoing", icon: "fa-fire" },
          { id: "complete", label: "Tamat", icon: "fa-circle-check" },
          { id: "jadwal", label: "Jadwal Rilis", icon: "fa-calendar-days" }
        ]
      : [
          { id: "home", label: "Episode Baru", icon: "fa-bolt" },
          { id: "new-series", label: "Series Baru", icon: "fa-star" },
          { id: "completed", label: "Tamat", icon: "fa-circle-check" },
          { id: "schedule", label: "Jadwal Donghua", icon: "fa-calendar-days" }
        ];

    nav.innerHTML = tabs
      .map(
        (t) => `
      <button class="btn-3d sec sm ${currentSubTab === t.id ? "active" : ""}" onclick="loadSection('${t.id}')">
        <i class="fa-solid ${t.icon}"></i> ${t.label}
      </button>
    `
      )
      .join("");
  }

  function switchMode(mode) {
    destroyHls();
    currentMode = mode;
    currentSubTab = "home";
    document.getElementById("modeAnimeBtn").classList.toggle("active", mode === "anime");
    document.getElementById("modeDonghuaBtn").classList.toggle("active", mode === "donghua");
    renderSubNav();
    loadSection("home");
  }

  function setLoader(msg) {
    document.getElementById("mainContent").innerHTML = `
      <div class="state-box">
        <div class="spinner"></div>
        <p style="color:var(--primary); font-weight:700;">${escapeHTML(msg)}</p>
      </div>
    `;
  }

  // Ekstraktor Fleksibel List Item dari JSON IrohaStream & Donghub
  function extractItemsFromJson(json) {
    const d = json?.data || json?.result || json || {};
    if (Array.isArray(d)) return d;
    if (Array.isArray(d.animeList)) return d.animeList;
    if (Array.isArray(d.ongoing?.animeList)) return d.ongoing.animeList;
    if (Array.isArray(d.completed?.animeList)) return d.completed.animeList;
    if (Array.isArray(d.list)) return d.list;
    if (Array.isArray(d.results)) return d.results;
    if (Array.isArray(d.latest)) return d.latest;
    if (Array.isArray(d.items)) return d.items;
    for (const k of Object.keys(d)) {
      if (Array.isArray(d[k]) && d[k].length > 0 && typeof d[k][0] === "object") return d[k];
    }
    return [];
  }

  async function loadSection(section) {
    destroyHls();
    currentSubTab = section;
    renderSubNav();
    setLoader(`Memuat katalog ${currentMode.toUpperCase()} (${section})...`);

    try {
      let path = "";
      if (currentMode === "anime") {
        if (section === "home") path = "/v1/anime/streaming/home";
        else if (section === "ongoing") path = "/v1/anime/streaming/ongoing?page=1";
        else if (section === "complete") path = "/v1/anime/streaming/complete?page=1";
        else if (section === "jadwal") path = "/v1/anime/streaming/jadwal";
      } else {
        path = `/v1/donghub?action=${encodeURIComponent(section)}`;
      }

      const json = await irohaFetch(path);

      if (section === "jadwal" || section === "schedule") {
        renderSchedule(json);
        return;
      }

      const list = extractItemsFromJson(json);
      renderMediaGrid(list);
    } catch (err) {
      document.getElementById("mainContent").innerHTML = `
        <div class="state-box">
          <p>Gagal memuat katalog: ${escapeHTML(err.message)}</p>
          <button class="btn-3d sm" style="margin-top:12px;" onclick="loadSection('${section}')">Coba Lagi</button>
        </div>
      `;
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    const q = document.getElementById("searchInput").value.trim();
    if (!q) return;
    destroyHls();
    setLoader(`Mencari "${q}" di ${currentMode.toUpperCase()}...`);

    try {
      const path = currentMode === "anime"
        ? `/v1/anime/streaming/search?q=${encodeURIComponent(q)}`
        : `/v1/donghub?action=search&q=${encodeURIComponent(q)}`;
      const json = await irohaFetch(path);
      const list = extractItemsFromJson(json);
      renderMediaGrid(list, `Hasil Pencarian: "${q}"`);
    } catch (err) {
      document.getElementById("mainContent").innerHTML = `<div class="state-box"><p>Pencarian gagal: ${escapeHTML(err.message)}</p></div>`;
    }
  }

  function renderMediaGrid(list, headingText = "") {
    const main = document.getElementById("mainContent");
    if (!Array.isArray(list) || list.length === 0) {
      main.innerHTML = `<div class="state-box"><p>Tidak ada judul ditemukan pada kategori ini.</p></div>`;
      return;
    }

    const cards = list
      .map((item) => {
        const id = item.animeId || item.slug || item.id || item.endpoint || "";
        const title = item.title || item.name || "Judul Streaming";
        const rawPoster = item.poster || item.thumb || item.image || item.cover || "";
        const poster = getPosterUrl(rawPoster, title);
        const badge = item.episodes || item.episode || item.latestEpisode || item.status || item.type || "Sub Indo";
        const isDirectEp = currentMode === "donghua" && String(id).includes("episode");

        const clickHandler = isDirectEp
          ? `openWatch('${escapeHTML(id)}', '${escapeHTML(title)}')`
          : `openDetail('${escapeHTML(id)}')`;

        return `
          <div class="card-3d" onclick="${clickHandler}">
            <div class="card-thumb">
              <span class="card-ep">${escapeHTML(badge)}</span>
              <img src="${escapeHTML(poster)}" alt="${escapeHTML(title)}" loading="lazy" referrerpolicy="no-referrer">
            </div>
            <div class="card-body">
              <h3 class="card-title">${escapeHTML(title)}</h3>
            </div>
          </div>
        `;
      })
      .join("");

    main.innerHTML = `
      ${headingText ? `<h3 style="margin-bottom:12px; font-family:'Outfit',sans-serif;">${escapeHTML(headingText)}</h3>` : ""}
      <div class="media-grid">${cards}</div>
    `;
  }

  function renderSchedule(json) {
    const d = json?.data || json?.result || json || {};
    const days = Array.isArray(d) ? d : d.scheduleList || d.days || d.list || [];
    const main = document.getElementById("mainContent");

    if (!Array.isArray(days) || days.length === 0) {
      const flat = extractItemsFromJson(json);
      if (flat.length > 0) return renderMediaGrid(flat, "Jadwal Rilis");
      main.innerHTML = `<div class="state-box"><p>Data jadwal belum tersedia.</p></div>`;
      return;
    }

    main.innerHTML = days
      .map((dayObj) => {
        const dayName = dayObj.day || dayObj.title || "Hari Ini";
        const items = dayObj.animeList || dayObj.list || dayObj.items || [];
        const links = items
          .map((x) => {
            const id = x.animeId || x.slug || x.id || "";
            return `<button class="ep-btn" onclick="openDetail('${escapeHTML(id)}')">${escapeHTML(x.title || x.name)}</button>`;
          })
          .join("");
        return `
          <div class="panel-3d">
            <h3 style="color:var(--primary); font-family:'Outfit',sans-serif;">
              <i class="fa-regular fa-calendar"></i> ${escapeHTML(dayName)}
            </h3>
            <div class="ep-grid">${links}</div>
          </div>
        `;
      })
      .join("");
  }

  // Detail Series (/v1/anime/streaming/anime/:animeId atau /v1/donghub?action=detail&slug=...)
  async function openDetail(id) {
    if (!id) return;
    destroyHls();
    setLoader("Memuat detail & daftar episode...");

    try {
      const path = currentMode === "anime"
        ? `/v1/anime/streaming/anime/${encodeURIComponent(id)}`
        : `/v1/donghub?action=detail&slug=${encodeURIComponent(id)}`;
      const json = await irohaFetch(path);
      const d = json?.data?.details || json?.data || json?.result || json || {};

      const title = d.title || d.name || id.replace(/-/g, " ").toUpperCase();
      const poster = getPosterUrl(d.poster || d.thumb || d.image || d.cover, title);
      const synopsis = Array.isArray(d.synopsis?.paragraphs)
        ? d.synopsis.paragraphs.join(" ")
        : d.synopsis || d.description || d.desc || "Pilih episode di bawah untuk mulai menonton.";
      const episodes = d.episodeList || d.episodes || d.chapterList || [];

      const epButtons = episodes
        .map((ep, idx) => {
          const epId = ep.episodeId || ep.slug || ep.id || "";
          const epTitle = ep.title || ep.name || `Episode ${ep.eps || episodes.length - idx}`;
          return `
            <button class="ep-btn" onclick="openWatch('${escapeHTML(epId)}', '${escapeHTML(epTitle)}', '${escapeHTML(id)}')">
              <i class="fa-solid fa-play" style="color:var(--primary); margin-right:6px;"></i> ${escapeHTML(epTitle)}
            </button>
          `;
        })
        .join("");

      document.getElementById("mainContent").innerHTML = `
        <div class="panel-3d">
          <div style="margin-bottom:14px;">
            <button class="btn-3d sec sm" onclick="loadSection('${currentSubTab}')">
              <i class="fa-solid fa-arrow-left"></i> Kembali
            </button>
          </div>
          <div class="detail-layout">
            <div class="detail-poster">
              <img src="${escapeHTML(poster)}" alt="${escapeHTML(title)}" referrerpolicy="no-referrer">
            </div>
            <div>
              <h2 style="font-family:'Outfit',sans-serif; font-size:24px; margin-bottom:8px;">${escapeHTML(title)}</h2>
              <p style="font-size:13px; color:#cbd5e1; line-height:1.55; margin-bottom:14px;">${escapeHTML(synopsis)}</p>
              <span class="btn-3d sm" style="pointer-events:none;">Total: ${episodes.length} Episode</span>
            </div>
          </div>
        </div>

        <div class="panel-3d">
          <h3 style="font-family:'Outfit',sans-serif; margin-bottom:6px;">
            <i class="fa-solid fa-film" style="color:var(--primary);"></i> Pilih Episode
          </h3>
          <div class="ep-grid">${epButtons || "<p>Belum ada daftar episode.</p>"}</div>
        </div>
      `;
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (currentMode === "donghua") {
        return openWatch(id, id);
      }
      document.getElementById("mainContent").innerHTML = `
        <div class="state-box">
          <p>Gagal memuat detail: ${escapeHTML(err.message)}</p>
          <button class="btn-3d sm" style="margin-top:12px;" onclick="loadSection('home')">Ke Beranda</button>
        </div>
      `;
    }
  }

  // Halaman Nonton (/v1/anime/streaming/episode/:episodeId atau /v1/donghub?action=watch&slug=...)
  async function openWatch(episodeId, epTitle = "", parentSeriesId = "") {
    if (!episodeId) return;
    destroyHls();
    setLoader("Menyiapkan server streaming & manifest video...");

    try {
      if (currentMode === "donghua") {
        const json = await irohaFetch(`/v1/donghub?action=watch&slug=${encodeURIComponent(episodeId)}`);
        const d = json?.data || json?.result || {};
        const title = d.title || epTitle || episodeId;
        const servers = Array.isArray(d.servers) ? d.servers : [];
        const initialUrl = d.videoUrl || servers[0]?.url || "";

        renderPlayerUI({
          title,
          parentSeriesId: parentSeriesId || d.seriesSlug || "",
          prevEp: d.prevEpisode || "",
          nextEp: d.nextEpisode || "",
          servers: servers.map((s, i) => ({
            name: s.name || `Server ${i + 1}`,
            url: s.url,
            type: "direct"
          })),
          initialUrl
        });
        return;
      }

      // Mode Anime (IrohaStream): episode/:id -> kumpulkan server (sid) -> /server-stream?sid&ep
      const json = await irohaFetch(`/v1/anime/streaming/episode/${encodeURIComponent(episodeId)}`);
      const d = json?.data?.details || json?.data || json || {};
      const title = d.title || epTitle || episodeId;

      let rawServers = [];
      if (Array.isArray(d.server?.qualities)) {
        d.server.qualities.forEach((q) => {
          (q.serverList || []).forEach((s) => {
            rawServers.push({
              name: `${s.title || "Server"} (${q.title || "HD"})`,
              sid: s.serverId || s.sid || s.id || "",
              url: s.url || "",
              ep: episodeId
            });
          });
        });
      } else if (Array.isArray(d.servers || d.serverList)) {
        rawServers = (d.servers || d.serverList).map((s, i) => ({
          name: s.name || s.title || `Server ${i + 1}`,
          sid: s.serverId || s.sid || s.id || "",
          url: s.url || "",
          ep: episodeId
        }));
      }

      const initialStream = d.defaultStreamingUrl || d.streamUrl || d.videoUrl || d.hlsUrl || "";

      renderPlayerUI({
        title,
        parentSeriesId: parentSeriesId || d.animeId || "",
        prevEp: d.prevEpisode?.episodeId || d.prevEpisode || "",
        nextEp: d.nextEpisode?.episodeId || d.nextEpisode || "",
        servers: rawServers,
        initialUrl: initialStream,
        episodeId
      });

      if (!initialStream && rawServers.length > 0) {
        switchAnimeServer(0);
      }
    } catch (err) {
      document.getElementById("mainContent").innerHTML = `
        <div class="state-box">
          <p>Gagal memuat streaming episode: ${escapeHTML(err.message)}</p>
          <button class="btn-3d sm" style="margin-top:12px;" onclick="loadSection('home')">Kembali</button>
        </div>
      `;
    }
  }

  let activeServerList = [];

  function renderPlayerUI(cfg) {
    activeServerList = cfg.servers || [];

    const serverButtons = activeServerList
      .map(
        (s, idx) => `
      <button class="btn-3d sec sm server-item-btn ${idx === 0 ? "active" : ""}" onclick="switchAnimeServer(${idx})">
        <i class="fa-solid fa-server"></i> ${escapeHTML(s.name)}
      </button>
    `
      )
      .join("");

    document.getElementById("mainContent").innerHTML = `
      <div class="panel-3d">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
          <div style="display:flex; gap:8px;">
            ${cfg.parentSeriesId ? `<button class="btn-3d sec sm" onclick="openDetail('${escapeHTML(cfg.parentSeriesId)}')"><i class="fa-solid fa-list"></i> Daftar Episode</button>` : `<button class="btn-3d sec sm" onclick="loadSection('home')"><i class="fa-solid fa-house"></i> Beranda</button>`}
          </div>
          <div style="display:flex; gap:8px;">
            ${cfg.prevEp ? `<button class="btn-3d sec sm" onclick="openWatch('${escapeHTML(cfg.prevEp)}')"><i class="fa-solid fa-chevron-left"></i> Prev</button>` : ""}
            ${cfg.nextEp ? `<button class="btn-3d sm" onclick="openWatch('${escapeHTML(cfg.nextEp)}')">Next <i class="fa-solid fa-chevron-right"></i></button>` : ""}
          </div>
        </div>

        <h2 style="font-family:'Outfit',sans-serif; font-size:19px; margin-top:14px;">
          <i class="fa-solid fa-circle-play" style="color:var(--primary);"></i> ${escapeHTML(cfg.title)}
        </h2>

        <div class="player-stage" id="playerStage"></div>

        ${serverButtons ? `<p style="font-size:12px; color:var(--text-sub); margin-top:8px;">Pilih Server Streaming / Mirror:</p><div class="server-bar">${serverButtons}</div>` : ""}
      </div>
    `;

    if (cfg.initialUrl) {
      mountStreamUrl(cfg.initialUrl);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function switchAnimeServer(idx) {
    const srv = activeServerList[idx];
    if (!srv) return;

    document.querySelectorAll(".server-item-btn").forEach((b, i) => b.classList.toggle("active", i === idx));
    const stage = document.getElementById("playerStage");
    if (stage) {
      stage.innerHTML = `<div style="display:flex;height:100%;align-items:center;justify-content:center;color:var(--primary);font-weight:700;">Menghubungkan ke ${escapeHTML(srv.name)}...</div>`;
    }

    try {
      if (srv.url && !srv.sid) {
        return mountStreamUrl(srv.url);
      }
      const resJson = await irohaFetch(
        `/v1/anime/streaming/server-stream?sid=${encodeURIComponent(srv.sid)}&ep=${encodeURIComponent(srv.ep || "")}`
      );
      const d = resJson?.data || resJson || {};
      const streamUrl = d.manifestUrl || d.hlsUrl || d.url || d.streamingUrl || d.embedUrl || "";
      if (streamUrl) {
        mountStreamUrl(streamUrl);
      } else {
        throw new Error("Stream kosong");
      }
    } catch (e) {
      if (srv.url) mountStreamUrl(srv.url);
    }
  }

  function destroyHls() {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  }

  function mountStreamUrl(rawUrl) {
    destroyHls();
    const stage = document.getElementById("playerStage");
    if (!stage || !rawUrl) return;

    let finalUrl = rawUrl;
    if (finalUrl.startsWith("/")) {
      finalUrl = `${DIRECT_BASE}${finalUrl}${finalUrl.includes("?") ? "&" : "?"}apikey=${FALLBACK_KEY}`;
    }

    const isHlsOrMp4 =
      finalUrl.includes(".m3u8") ||
      finalUrl.includes("/stream/manifest") ||
      finalUrl.includes(".mp4");

    if (isHlsOrMp4) {
      stage.innerHTML = `<video id="hlsVideoEl" controls autoplay playsinline></video>`;
      const video = document.getElementById("hlsVideoEl");

      if ((finalUrl.includes(".m3u8") || finalUrl.includes("/stream/manifest")) && window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(finalUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = finalUrl;
      }
    } else {
      stage.innerHTML = `<iframe src="${escapeHTML(finalUrl)}" allowfullscreen allow="autoplay; encrypted-media"></iframe>`;
    }
  }

  function setTheme(theme) {
    if (theme === "gold") document.documentElement.setAttribute("data-theme", "gold");
    else document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("ks_theme", theme);
    const c = document.getElementById("dotCyan");
    const g = document.getElementById("dotGold");
    if (c) c.classList.toggle("active", theme !== "gold");
    if (g) g.classList.toggle("active", theme === "gold");
  }

  function toggleFullScreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen().catch(() => {});
  }

  Object.assign(window, {
    switchMode,
    loadSection,
    handleSearch,
    openDetail,
    openWatch,
    switchAnimeServer,
    setTheme,
    toggleFullScreen
  });

  injectStyles();
  renderShell();
  setTheme(localStorage.getItem("ks_theme") || "cyan");
  loadSection("home");
})();
