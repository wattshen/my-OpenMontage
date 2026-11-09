// Shared helpers for the Backlot UI.

export async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null) continue;
    if (k === "class") node.className = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  for (const child of children.flat()) {
    if (child == null) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
}


export const PIPELINE_LABELS = {
  "animated-explainer": "动画解说",
  "talking-head": "口播视频",
  "screen-demo": "屏幕演示",
  "clip-factory": "切片工厂",
  "podcast-repurpose": "播客再创作",
  "cinematic": "电影感剪辑",
  "animation": "动画",
  "character-animation": "角色动画",
  "hybrid": "混合视频",
  "avatar-spokesperson": "数字人",
  "localization-dub": "本地化配音",
  "framework-smoke": "框架测试",
  "unknown": "未知",
};

export const STAGE_LABELS = {
  research: "研究",
  proposal: "提案",
  idea: "创意",
  script: "脚本",
  scene_plan: "分镜规划",
  assets: "素材",
  edit: "剪辑",
  compose: "合成",
  publish: "发布",
};

export const STATUS_LABELS = {
  pending: "待运行",
  in_progress: "进行中",
  awaiting_human: "等待审批",
  completed: "已完成",
  failed: "失败",
  unknown: "未知",
};


export const STYLE_PLAYBOOK_LABELS = {
  "clean-professional": "专业简洁",
  "premium-minimalist": "高级极简",
  "flat-motion-graphics": "扁平动效",
  "minimalist-diagram": "极简图解",
  "ink-sketch": "水墨速写",
};

export const RUNTIME_LABELS = {
  remotion: "Remotion",
  hyperframes: "HyperFrames",
  ffmpeg: "FFmpeg",
};

export const DECISION_CATEGORY_LABELS = {
  pipeline_selection: "管线选择",
  provider_selection: "供应商选择",
  renderer_family_selection: "渲染类型",
  render_runtime_selection: "运行时选择",
  composition_mode: "制作方式",
  playbook_selection: "风格选择",
  fallback_decision: "降级方案",
  budget_tradeoff: "预算取舍",
  downgrade_approval: "降级审批",
  music_source: "音乐来源",
  motion_commitment: "动效承诺",
  concept_selection: "方案选择",
  voice_selection: "声音选择",
  capability_extension: "能力扩展",
  playbook_override: "风格覆盖",
  visual_accuracy_check: "视觉准确性检查",
};

export function pipelineLabel(value) {
  return PIPELINE_LABELS[value] || String(value || "未知").replaceAll("-", " ");
}

export function stageLabel(value) {
  return STAGE_LABELS[value] || String(value || "").replaceAll("_", " ");
}

export function statusLabel(value) {
  return STATUS_LABELS[value] || String(value || "未知");
}

export function playbookLabel(value) {
  return STYLE_PLAYBOOK_LABELS[value] || String(value || "").replaceAll("-", " ");
}

export function runtimeLabel(value) {
  return RUNTIME_LABELS[value] || String(value || "");
}

export function decisionCategoryLabel(value) {
  return DECISION_CATEGORY_LABELS[value] || String(value || "决策").replaceAll("_", " ");
}


export function fmtDuration(seconds) {
  const n = Number(seconds);
  if (seconds == null || !Number.isFinite(n)) return "";
  const s = Math.max(0, Math.round(n));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

export function fmtMoney(v) {
  const n = Number(v);
  if (v == null || !Number.isFinite(n)) return "—";
  return `$${n.toFixed(2)}`;
}

export function fmtAgo(epochSeconds) {
  if (!epochSeconds) return "";
  const diff = Date.now() / 1000 - epochSeconds;
  if (diff < 90) return "刚刚";
  if (diff < 3600) return `${Math.round(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.round(diff / 3600)} 小时前`;
  return `${Math.round(diff / 86400)} 天前`;
}

export function fmtClock(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return "";
  }
}

export function mediaURL(projectId, relPath) {
  return `/media/${encodeURIComponent(projectId)}/${relPath.split("/").map(encodeURIComponent).join("/")}`;
}

// Downscaled cached JPEG for images (full media only in players/lightbox).
export function thumbURL(projectId, relPath, w = 640) {
  return `/thumb/${encodeURIComponent(projectId)}/${relPath.split("/").map(encodeURIComponent).join("/")}?w=${w}`;
}

// Subscribe to a server-sent change feed; call onChange (debounced) per burst.
export function subscribe(url, onChange) {
  let timer = null;
  const source = new EventSource(url);
  source.onmessage = (msg) => {
    try {
      const data = JSON.parse(msg.data);
      if (data.type !== "change") return;
    } catch {
      return;
    }
    clearTimeout(timer);
    timer = setTimeout(onChange, 250);
  };
  source.onerror = () => { /* EventSource auto-reconnects */ };
  return source;
}

// Deterministic pseudo-waveform bars (seeded by a string).
export function waveBars(container, seedStr, count = 26, maxH = 14) {
  let seed = 0;
  for (const c of seedStr || "wave") seed = (seed * 31 + c.charCodeAt(0)) % 2147483647;
  seed = seed || 7;
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    seed = (seed * 16807) % 2147483647;
    const h = 3 + ((seed % 100) / 100) * maxH * (0.55 + 0.45 * Math.sin(i / 5));
    const bar = document.createElement("i");
    bar.style.height = `${Math.max(3, h)}px`;
    container.append(bar);
  }
}

export const STAGE_ICONS = {
  completed: "✓",
  in_progress: "◉",
  awaiting_human: "◈",
  failed: "✕",
};
