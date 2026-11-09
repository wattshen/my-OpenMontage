import { el, fmtAgo, getJSON, pipelineLabel, stageLabel, statusLabel, subscribe, thumbURL } from "/ui/lib.js";

const grid = document.getElementById("grid");
const THEME_KEY = "backlot.theme";
let currentTheme = localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";

function applyTheme(theme) {
  currentTheme = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = currentTheme;
  localStorage.setItem(THEME_KEY, currentTheme);
}

function renderThemeToggle() {
  const next = currentTheme === "light" ? "dark" : "light";
  return el("button", {
    class: "theme-toggle",
    type: "button",
    title: `切换到${next === "light" ? "浅色" : "深色"}主题`,
    "aria-label": `切换到${next === "light" ? "浅色" : "深色"}主题`,
    "aria-pressed": currentTheme === "light" ? "true" : "false",
    onclick: () => {
      applyTheme(next);
      const replacement = renderThemeToggle();
      document.querySelector(".theme-toggle").replaceWith(replacement);
    },
  }, el("span", { class: "theme-toggle-icon", "aria-hidden": "true" }, currentTheme === "light" ? "☾" : "☀"));
}

applyTheme(currentTheme);
document.getElementById("liveBadge").before(renderThemeToggle());

function miniRail(states) {
  const rail = el("div", { class: "mini-rail" });
  for (const s of states) {
    const cls = s.status === "completed" ? "d"
      : s.status === "in_progress" ? "a"
      : s.status === "awaiting_human" ? "w" : "";
    rail.append(el("i", { class: cls, title: `${stageLabel(s.name)}：${statusLabel(s.status)}` }));
  }
  return rail;
}

function card(p) {
  const poster = el("div", { class: "lib-poster" });
  if (p.poster) {
    poster.append(el("img", { src: thumbURL(p.project_id, p.poster, 640), loading: "lazy", alt: "" }));
  } else {
    poster.append(el("span", { class: "lp-txt" }, "暂无媒体"));
  }
  if (p.live && p.active_stage) {
    poster.append(el("span", { class: "lp-live" },
      el("span", { class: "dot" }),
      p.awaiting_human ? "◈ 等待你审批" : `运行中 · ${stageLabel(p.active_stage)}`));
  } else if (p.awaiting_human) {
    poster.append(el("span", { class: "lp-live" }, "◈ 等待你审批"));
  }

  const meta = el("div", { class: "lb-meta" },
    el("span", { class: "chip" }, pipelineLabel(p.pipeline_type)),
    p.scene_count ? el("span", { class: "chip" }, `${p.scene_count} 个场景`) : null,
    p.render_count ? el("span", { class: "chip" }, `${p.render_count} 个成片`) : null,
    el("span", { class: "when" }, fmtAgo(p.last_activity)),
  );

  const staticSuffix = new URLSearchParams(location.search).has("static") ? "?static=1" : "";
  return el("a", { class: `lib-card${p.live ? " live-card" : ""}`, href: `/p/${p.project_id}${staticSuffix}`, style: "text-decoration:none;color:inherit" },
    poster,
    el("div", { class: "lib-body" },
      el("h3", {}, (p.title || p.project_id).toUpperCase()),
      meta,
      p.stage_states.length ? miniRail(p.stage_states) : null,
    ),
  );
}

// ---------------------------------------------------------------------------
// Series navigation. Projects may carry an optional `series` label
// (project.json). The library shows one card per series plus every loose
// project; `/?series=<name>` shows that series' projects with the original
// grid; `/?view=series` lists only the series. Projects without a label
// render exactly as they always did.
// ---------------------------------------------------------------------------

const params = new URLSearchParams(location.search);
const isStatic = params.has("static");

function libURL(query = {}) {
  const q = new URLSearchParams(query);
  if (isStatic) q.set("static", "1");
  const s = q.toString();
  return s ? `/?${s}` : "/";
}

function seriesCard(name, members) {
  const live = members.filter((p) => p.live).length;
  const awaiting = members.filter((p) => p.awaiting_human).length;
  const latest = Math.max(...members.map((p) => p.last_activity || 0));
  const lead = members.find((p) => p.poster);
  const poster = el("div", { class: "lib-poster" });
  if (lead) {
    poster.append(el("img", { src: thumbURL(lead.project_id, lead.poster, 640), loading: "lazy", alt: "" }));
  } else {
    poster.append(el("span", { class: "lp-txt" }, "暂无媒体"));
  }
  if (live || awaiting) {
    poster.append(el("span", { class: "lp-live" },
      live ? el("span", { class: "dot" }) : null,
      [live ? `${live} 个运行中` : null, awaiting ? `◈ ${awaiting} 个等待审批` : null].filter(Boolean).join(" · ")));
  }
  return el("a", {
    class: `lib-card series-card${live ? " live-card" : ""}`,
    href: libURL({ series: name }),
    style: "text-decoration:none;color:inherit",
  },
    poster,
    el("div", { class: "lib-body" },
      el("h3", {}, el("span", { class: "series-tag" }, "剧集"), " ", name.toUpperCase()),
      el("div", { class: "lb-meta" },
        el("span", { class: "chip" }, `${members.length} 个项目`),
        el("span", { class: "when" }, fmtAgo(latest)),
      ),
    ),
  );
}

// Projects arrive live-first, then by recency; a series takes the slot of its
// most relevant member, loose projects keep their own slot.
function group(projects) {
  const bySeries = new Map();
  const items = [];
  for (const p of projects) {
    if (!p.series) { items.push(p); continue; }
    if (!bySeries.has(p.series)) { bySeries.set(p.series, []); items.push({ series: p.series }); }
    bySeries.get(p.series).push(p);
  }
  return { items, bySeries };
}

function renderNav(current, bySeries, view) {
  const nav = document.getElementById("nav");
  nav.innerHTML = "";
  if (!bySeries.size && !current) { nav.hidden = true; return; }
  nav.hidden = false;
  if (current) {
    nav.append(el("a", { class: "nav-link", href: libURL() }, "← 项目库"));
    nav.append(el("a", { class: "nav-link", href: libURL({ view: "series" }) }, "全部剧集"));
    if (bySeries.size > 1) {
      const pick = el("select", {
        class: "nav-select", "aria-label": "跳转到剧集",
        onchange: (e) => { location.href = libURL({ series: e.target.value }); },
      });
      for (const name of bySeries.keys()) {
        const opt = el("option", { value: name }, name);
        if (name === current) opt.selected = true;
        pick.append(opt);
      }
      nav.append(pick);
    }
  } else {
    nav.append(el("a", { class: `nav-link${view === "series" ? "" : " on"}`, href: libURL() }, "全部"));
    nav.append(el("a", { class: `nav-link${view === "series" ? " on" : ""}`, href: libURL({ view: "series" }) }, `剧集 (${bySeries.size})`));
  }
}

async function render() {
  const projects = await getJSON("/api/projects");
  const { items, bySeries } = group(projects);
  const current = params.get("series");
  const view = params.get("view");
  const shown = current ? (bySeries.get(current) || []) : projects;

  document.getElementById("title").textContent = current ? current.toUpperCase() : (view === "series" ? "剧集" : "项目库");
  document.title = current ? `Backlot — ${current}` : "Backlot — 项目库";
  document.getElementById("count").textContent = current
    ? `${shown.length} 个项目`
    : `${projects.length} 个项目` + (bySeries.size ? ` · ${bySeries.size} 个剧集` : "");
  const liveCount = shown.filter((p) => p.live).length;
  const badge = document.getElementById("liveBadge");
  badge.classList.toggle("idle", liveCount === 0);
  document.getElementById("liveText").textContent = liveCount ? `${liveCount} 个运行中` : "空闲";
  renderNav(current, bySeries, view);

  grid.innerHTML = "";
  const empty = document.getElementById("empty");
  if (current) {
    empty.textContent = `剧集 "${current}" 中还没有项目。`;
    empty.style.display = shown.length ? "none" : "block";
    for (const p of shown) grid.append(card(p));
    return;
  }
  if (view === "series") {
    empty.textContent = "还没有剧集——在项目的 project.json 中添加 \"series\" 标签。";
    empty.style.display = bySeries.size ? "none" : "block";
    for (const [name, members] of bySeries) grid.append(seriesCard(name, members));
    return;
  }
  empty.textContent = "还没有项目。开始一次生产后，项目会出现在这里。";
  empty.style.display = projects.length ? "none" : "block";
  for (const item of items) {
    grid.append(item.project_id ? card(item) : seriesCard(item.series, bySeries.get(item.series)));
  }
}

render().catch(console.error);
if (!isStatic) {
  subscribe("/api/library/events", () => render().catch(console.error));
}
