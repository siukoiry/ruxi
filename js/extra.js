const DEFAULT_WORLD = `你是角色扮演引擎。只输出 JSON 数组，不要解释，不要 Markdown。
可用 type：call, wechat_private, wechat_group, wechat_sys, stamp, moments, weibo_hot, weibo_post, douyin, sms, notice, order, stats, say, header
不要输出 scene。用户原话已在界面上，不要重复。一次 1～4 个模块。对白短。数值变化才出 stats，不要写加减原因。`;

function md(src) {
  let s = escapeHtml(String(src || ""));
  s = s.replace(/```([\s\S]*?)```/g, (_, c) => `<pre><code>${c}</code></pre>`);
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/^\s*### (.+)$/gm, "<h3>$1</h3>");
  s = s.replace(/^\s*## (.+)$/gm, "<h2>$1</h2>");
  s = s.replace(/^\s*[-*] (.+)$/gm, "<li>$1</li>");
  s = s.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");
  s = s.replace(/\n/g, "<br>");
  return s;
}

function loadExtra() {
  try { return JSON.parse(localStorage.getItem("ruxi.extra.v1")) || {}; }
  catch { return {}; }
}
function saveExtra(x) { localStorage.setItem("ruxi.extra.v1", JSON.stringify(x)); }

function extraState() {
  const x = loadExtra();
  if (!x.world) x.world = DEFAULT_WORLD;
  if (!Array.isArray(x.chars)) x.chars = [];
  if (!Array.isArray(x.keys)) x.keys = [];
  return x;
}

function setWorld(text) {
  const x = extraState();
  x.world = text;
  saveExtra(x);
}
function upsertChar(ch) {
  const x = extraState();
  const i = x.chars.findIndex(c => c.id === ch.id);
  if (i >= 0) x.chars[i] = ch; else x.chars.push(ch);
  saveExtra(x);
}
function deleteChar(id) {
  const x = extraState();
  x.chars = x.chars.filter(c => c.id !== id);
  if (x.activeChar === id) x.activeChar = "";
  saveExtra(x);
}
function setActiveChar(id) {
  const x = extraState();
  x.activeChar = id;
  saveExtra(x);
}

function rpSystem() {
  const x = extraState();
  const ch = x.chars.find(c => c.id === x.activeChar);
  let s = x.world || DEFAULT_WORLD;
  if (ch) {
    s += `\n\n当前角色卡：${ch.name}\n${ch.persona || ""}\n开场白：${ch.greeting || ""}`;
  }
  return s;
}

function exportAll() {
  const data = {
    v: 1,
    extra: extraState(),
    threads: JSON.parse(localStorage.getItem("ruxi.threads.v2") || '{"threads":[]}'),
    api: JSON.parse(localStorage.getItem("ruxi.api.v1") || "{}")
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "ruxi-backup.json";
  a.click();
}

function importAll(obj) {
  if (obj.extra) localStorage.setItem("ruxi.extra.v1", JSON.stringify(obj.extra));
  if (obj.threads) localStorage.setItem("ruxi.threads.v2", JSON.stringify(obj.threads));
  if (obj.api) localStorage.setItem("ruxi.api.v1", JSON.stringify(obj.api));
}
