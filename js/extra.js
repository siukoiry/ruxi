const DEFAULT_WORLD = `你是角色扮演引擎。只输出 JSON 数组，不要解释，不要 Markdown。
可用 type：call, wechat_private, wechat_group, wechat_sys, stamp, moments, weibo_hot, weibo_post, douyin, sms, notice, order, stats, say, header
不要输出 scene。用户原话已在界面上，不要重复。一次 1～4 个模块。对白短。数值变化才出 stats，不要写加减原因。`;

const DEFAULT_RULES = [
  { id: "r1", on: true, title: "只出 JSON", text: "只输出 JSON 数组。不要解释，不要 Markdown，不要前言。" },
  { id: "r2", on: true, title: "可用模块", text: "type 只能是：call, wechat_private, wechat_group, wechat_sys, stamp, moments, weibo_hot, weibo_post, douyin, sms, notice, order, stats, say, header" },
  { id: "r3", on: true, title: "不要场景卡", text: "不要输出 scene。用户原话已在界面上，不要重复。" },
  { id: "r4", on: true, title: "短回复", text: "一次 1～4 个模块。对白短，像真人手机聊天。" },
  { id: "r5", on: true, title: "数值不解释", text: "数值变化时才出 stats，不要写加减原因。" }
];

function md(src) {
  const fences = [];
  let s = String(src || "").replace(/```\w*\n?([\s\S]*?)```/g, (_, c) => {
    const i = fences.length;
    fences.push("<pre class=\"md-code\"><code>" + escapeHtml(c.trim()) + "</code></pre>");
    return "%%FENCE" + i + "%%";
  });
  s = escapeHtml(s);
  s = s.replace(/`([^`]+)`/g, "<code class=\"md-inline\">$1</code>");
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|\n)### (.+)/g, "$1<h3>$2</h3>");
  s = s.replace(/(^|\n)## (.+)/g, "$1<h2>$2</h2>");
  s = s.replace(/(^|\n)# (.+)/g, "$1<h2>$2</h2>");
  s = s.replace(/(^|\n)&gt; (.+)/g, "$1<blockquote>$2</blockquote>");
  s = s.replace(/(^|\n)[-*] (.+)/g, "$1<li>$2</li>");
  s = s.replace(/(?:<li>[\s\S]*?<\/li>\n?)+/g, m => "<ul>" + m.replace(/\n/g, "") + "</ul>");
  s = "<p>" + s.replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>") + "</p>";
  fences.forEach((html, i) => { s = s.replace("%%FENCE" + i + "%%", html); });
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
  if (!Array.isArray(x.rules) || !x.rules.length) {
    x.rules = DEFAULT_RULES.map(r => ({ ...r }));
    if (x.world && x.world !== DEFAULT_WORLD) {
      x.rules.push({ id: "custom", on: true, title: "我改过的整段", text: x.world });
    }
  }
  return x;
}

function setWorld(text) {
  const x = extraState();
  x.world = text;
  saveExtra(x);
}
function upsertRule(rule) {
  const x = extraState();
  const i = x.rules.findIndex(r => r.id === rule.id);
  if (i >= 0) x.rules[i] = rule; else x.rules.push(rule);
  saveExtra(x);
}
function deleteRule(id) {
  const x = extraState();
  x.rules = x.rules.filter(r => r.id !== id);
  saveExtra(x);
}
function toggleRule(id) {
  const x = extraState();
  const r = x.rules.find(v => v.id === id);
  if (r) { r.on = !r.on; saveExtra(x); }
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
  const enabled = (x.rules || []).filter(r => r.on);
  let s = enabled.length
    ? enabled.map((r, i) => (i + 1) + ". " + r.title + "：" + r.text).join("\n")
    : (x.world || DEFAULT_WORLD);
  if (ch) {
    s += `\n\n当前角色卡：${ch.name}\n人设：${ch.persona || ""}\n开场白：${ch.greeting || ""}`;
    if (ch.example) s += `\n示例对白：\n${ch.example}`;
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

function deleteKey(id) {
  const x = extraState();
  x.keys = (x.keys || []).filter(k => k.id !== id);
  if (x.activeKey === id) x.activeKey = "";
  saveExtra(x);
}
function setActiveKey(id) {
  const x = extraState();
  x.activeKey = id;
  saveExtra(x);
}
