
function showHome() {
  document.getElementById("screen-home").classList.add("on");
  document.getElementById("screen-chat").classList.remove("on");
  const set = document.getElementById("screen-settings");
  if (set) set.classList.remove("on");
}
function openProjectFromHome(pid) {
  state.project = pid;
  setPlus();
  const list = threadsOf(pid);
  if (list[0]) openThread(list[0].id);
  else newThread(false);
  document.getElementById("screen-home").classList.remove("on");
  document.getElementById("screen-chat").classList.add("on");
  const set = document.getElementById("screen-settings");
  if (set) set.classList.remove("on");
}
document.querySelectorAll("[data-open]").forEach(btn => {
  btn.onclick = () => openProjectFromHome(btn.dataset.open);
});
const homeBtn = document.getElementById("btn-home");
if (homeBtn) homeBtn.onclick = showHome;
const splashEl = document.getElementById("splash");
if (splashEl) {
  const done = () => { splashEl.classList.add("gone"); showHome(); };
  const enter = document.getElementById("splash-enter");
  if (enter) enter.addEventListener("click", ev => { ev.stopPropagation(); done(); });
  splashEl.addEventListener("click", done);
}

/* legacy boot — full original app */
const DEMO_STREAM = [
  { type: "scene", no: "03", time: "8月26日 18:42", place: "海口·秀英区 出租屋", weather: "台风 阵风12级", who: ["林晚（你）"], beat: "窗外铁皮在响，灯闪了两下" },
  { type: "notice", from: "天气预警", title: "海南省气象台发布台风紧急预警", text: "海口、文昌、琼海今夜有 12 级阵风，请避免外出。" },
  { type: "weibo_hot", items: [
    { title: "广东提醒高层住宅注意防风", heat: "980万", tag: "爆" },
    { title: "台风摩羯登陆海南", heat: "856万", tag: "爆" },
    { title: "海南发布紧急通知非必要不出门", heat: "723万", tag: "热" },
    { title: "广西启动防台风一级响应", heat: "567万", tag: "热" },
    { title: "海口市民抢购物资", heat: "489万", tag: "新" }
  ]},
  { type: "moments", name: "海口同城会", time: "2分钟前", text: "今晚千万别出门。", image: "货架空了，矿泉水和泡面所剩无几", place: "海口·秀英区", likes: ["椰风不凉", "雨下了一整晚", "不吃香菜人士"], comments: [
    { name: "椰风不凉", text: "楼下小卖部就剩两包盐了" },
    { name: "雨下了一整晚", text: "今年这个台风属实有点猛" },
    { name: "不吃香菜人士", reply_to: "椰风不凉", text: "先别出门" }
  ]},
  { type: "stamp", text: "今天 18:43" },
  { type: "wechat_sys", text: "海口同城会 邀请 椰风不凉 加入群聊" },
  { type: "wechat_group", group: "海南台风互助", name: "海口同城会", text: "今晚别出门，秀英风已经很大了" },
  { type: "wechat_group", name: "椰风不凉", text: "楼下停水了吗" },
  { type: "wechat_group", name: "雨下了一整晚", at: "海口同城会", text: "还能买到水吗" },
  { type: "order", app: "美团", shop: "琼香鸡饭 · 秀英店", status: "配送中", eta: "预计 18:46 送达", dishes: ["招牌鸡腿饭 ×1", "加蛋 ×1"], price: "¥28.6", address: "秀英区某小区 3栋", rider: "阿坤　3分钟前已取餐" },
  { type: "say", name: "林晚", said: "别出门，今晚风太大。", thought: "其实门一响自己也想跑" },
  { type: "stats", items: [{ name: "信任", value: 37 }, { name: "恐惧", value: 54 }] }
];

const DEMO_JSON = [
  { type: "scene", no: "04", time: "8月26日 19:01", place: "楼梯口", weather: "台风", who: ["林晚（你）", "海口同城会"], beat: "应急灯只剩一条白缝" },
  { type: "call", from: "海口同城会", channel: "微信视频", status: "响铃中" },
  { type: "say", name: "林晚", said: "你先挂吧。", thought: "别挂" }
];

const QUICK = [
  ["看热搜", { type: "weibo_hot", items: [
    { title: "海口多处路树倒塌", heat: "612万", tag: "爆" },
    { title: "居民楼窗户被掀翻", heat: "401万", tag: "热" },
    { title: "谁还在点外卖", heat: "188万", tag: "新" }
  ]}],
  ["来短信", { type: "sms", from: "美团", text: "验证码 184726，5分钟内有效。请勿泄露给他人。" }],
  ["刷抖音", { type: "douyin", name: "海口同城会", text: "今晚的海口，风比人响。", image: "骑楼街空无一人，招牌被吹歪", music: "原声 · 海口同城会", likes: "12.8万", replies: "8604", reposts: "2.1万", favs: "1.4万", comments: [
    { name: "椰风不凉", text: "这风声也太假了吧，滤镜？" },
    { name: "雨下了一整晚", text: "假什么假，秀英现在窗都在抖" },
    { name: "不吃香菜人士", text: "别出门挑刺了，先回家" }
  ]}],
  ["微博正文", { type: "weibo_post", name: "海口同城会", time: "今天 18:03", from: "微博视频", text: "超市货架都空了，矿泉水泡面抢得最快。大家别慌，海口不缺物资，但今晚千万别出门。", likes: "4.2万", replies: "8906", reposts: "2103", comments: [
    { name: "椰风不凉", text: "楼下小卖部就剩两包盐，老板自己都愣住了" },
    { name: "雨下了一整晚", text: "海南人年年抗台风，今年这个属实有点猛" }
  ]}],
  ["私聊", { type: "wechat_private", name: "海口同城会", text: "你那边窗户关好了吗" }]
];
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}

function tagOf(t) {
  if (t === "爆" || t === "沸") return "bao";
  if (t === "热") return "re";
  return "xin";
}

function colorFor(v) {
  if (v >= 85) return "#e6162d";
  if (v >= 60) return "#e85a7a";
  if (v >= 30) return "#e8a0b0";
  return "#8a8a8a";
}

function renderBlock(item) {
  const t = item.type;
  if (t === "scene") return scene(item);
  if (t === "call") return callCard(item);
  if (t === "wechat_private") return wx(item, false);
  if (t === "wechat_group") return wx(item, true);
  if (t === "wechat_sys") return `<div class="sys">${esc(item.text)}</div>`;
  if (t === "stamp") return `<div class="stamp">${esc(item.text)}</div>`;
  if (t === "moments") return moments(item);
  if (t === "weibo_hot") return hot(item);
  if (t === "weibo_post") return weiboPost(item);
  if (t === "douyin") return douyin(item);
  if (t === "sms" || t === "notice") return sms(item);
  if (t === "order") return order(item);
  if (t === "stats") return stats(item);
  if (t === "say") return say(item);
  if (t === "header") return `<div class="kicker">${esc(item.text)}</div>`;
  return `<div class="mod">${esc(JSON.stringify(item))}</div>`;
}

function scene(d) {
  const rows = [
    ["场", d.no], ["时间", d.time], ["地点", d.place],
    ["天气", d.weather], ["在场", (d.who || []).join("、")], ["状态", d.beat]
  ].filter(([, v]) => v);
  return `<article class="mod scene">
    <div class="kicker">场景卡</div>
    ${rows.map(([k, v]) => `<div class="rowline"><span class="lab">${k}</span><span>${esc(v)}</span></div>`).join("")}
  </article>`;
}

function callCard(d) {
  const st = d.status || "响铃中";
  return `<article class="mod call-card">
    <div class="kicker">${esc(d.channel || "来电")}</div>
    <div class="ava">${esc((d.from || "?").slice(0, 1))}</div>
    <h3>${esc(d.from)}</h3>
    <p class="sub">${esc(st)} · ${esc(d.channel || "手机")}</p>
    <div class="btns">
      <span class="round red">拒绝</span>
      <span class="round green">接听</span>
    </div>
  </article>`;
}

function wx(d, group) {
  const me = !!d.me;
  const name = group || !me ? `<div class="wx-name">${esc(d.name || "")}</div>` : "";
  const at = d.at ? `<span style="color:var(--wx-blue)">@${esc(d.at)} </span>` : "";
  return `<article class="wx-msg ${me ? "me" : ""}">
    ${name}
    <div class="bubble">${at}${esc(d.text)}</div>
  </article>`;
}

function moments(d) {
  const comments = (d.comments || []).map(c => {
    const rep = c.reply_to ? `<span class="rep">回复</span> <b>${esc(c.reply_to)}</b> ` : "";
    return `<div class="cmt"><b>${esc(c.name)}</b> ${rep}${esc(c.text)}</div>`;
  }).join("");
  const photo = d.image ? `<div class="photo"><small>图 · ${esc(d.image)}</small></div>` : "";
  return `<article class="mod moments">
    <div class="who">${esc(d.name)}</div>
    <div class="when">${esc(d.time || "")}</div>
    <div class="body">${esc(d.text || "")}</div>
    ${photo}
    ${d.place ? `<div class="place">地点 · ${esc(d.place)}</div>` : ""}
    <div class="interact">
      <div class="likes"><i>♡</i>${esc((d.likes || []).join("、"))}</div>
      ${comments}
    </div>
  </article>`;
}

function hot(d) {
  const items = (d.items || []).map((it, i) => `
    <div class="item">
      <div class="n">${i + 1}</div>
      <div>
        <div class="t">${esc(it.title)}</div>
        <div class="meta">${esc(it.heat)} <span class="tag ${tagOf(it.tag)}">${esc(it.tag)}</span></div>
      </div>
    </div>`).join("");
  return `<article class="mod hot">
    <div class="kicker">微博热搜</div>
    ${items}
  </article>`;
}

function weiboPost(d) {
  const cs = (d.comments || []).map(c => `
    <div class="w-cmt"><div class="id">@${esc(c.name)}</div><p>${esc(c.text)}</p></div>
  `).join("");
  return `<article class="mod weibo-post">
    <div class="id">@${esc(d.name)}</div>
    <div class="ago">${esc(d.time || "")} · ${esc(d.from || "微博")}</div>
    <div class="body">${esc(d.text)}</div>
    <div class="eng">赞 ${esc(d.likes)}　评论 ${esc(d.replies)}　转发 ${esc(d.reposts)}</div>
    ${cs}
  </article>`;
}

function douyin(d) {
  const cs = (d.comments || []).map(c => `
    <div class="cmt"><b style="color:var(--pink)">@${esc(c.name)}</b> ${esc(c.text)}</div>
  `).join("");
  return `<article class="mod dy">
    <div class="kicker">抖音</div>
    <div class="author">@${esc(d.name)}</div>
    <div class="cap">${esc(d.text)}</div>
    ${d.image ? `<div class="photo"><small>视频 · ${esc(d.image)}</small></div>` : ""}
    <div class="music">♪ ${esc(d.music || "原声")}</div>
    <div class="counts"><span class="z">赞 ${esc(d.likes)}</span>　评 ${esc(d.replies)}　转 ${esc(d.reposts)}　藏 ${esc(d.favs)}</div>
    <div class="interact">${cs}</div>
  </article>`;
}

function sms(d) {
  return `<article class="mod sms">
    <div class="kicker">${d.type === "notice" ? "系统通知" : "短信"} · ${esc(d.from)}</div>
    ${d.title ? `<div class="alert">${esc(d.title)}</div>` : ""}
    <div>${esc(d.text)}</div>
  </article>`;
}

function order(d) {
  const dishes = (d.dishes || []).map(x => `<div>${esc(x)}</div>`).join("");
  return `<article class="mod order">
    <div class="kicker">外卖 · ${esc(d.app || "美团")}</div>
    <div class="shop">${esc(d.shop)}</div>
    <div class="st">${esc(d.status)}　${esc(d.eta || "")}</div>
    <div class="line"></div>
    ${dishes}
    <div class="dim">${esc(d.price || "")}</div>
    <div class="line"></div>
    <div class="dim">地址　${esc(d.address)}</div>
    <div class="dim">骑手　${esc(d.rider)}</div>
  </article>`;
}

function stats(d) {
  const rows = (d.items || []).map(it => `
    <div class="barline">
      <div class="name">${esc(it.name)}</div>
      <div class="track"><div class="fill" style="width:${Math.max(0, Math.min(100, it.value))}%;background:${colorFor(it.value)}"></div></div>
      <div class="num">${esc(it.value)}</div>
    </div>`).join("");
  return `<article class="mod stats"><div class="kicker">状态</div>${rows}</article>`;
}

function say(d) {
  return `<article class="mod say">
    <div class="name">${esc(d.name)}</div>
    <div class="line">「${esc(d.said)}」</div>
    ${d.thought ? `<div class="inner">${esc(d.thought)}</div>` : ""}
  </article>`;
}
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
  if (!Array.isArray(x.prompts)) x.prompts = [];
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

function upsertPrompt(pr) {
  const x = extraState();
  const i = x.prompts.findIndex(p => p.id === pr.id);
  if (i >= 0) x.prompts[i] = pr; else x.prompts.push(pr);
  saveExtra(x);
}
function deletePrompt(id) {
  const x = extraState();
  x.prompts = x.prompts.filter(p => p.id !== id);
  saveExtra(x);
}

const DEMO_MD = `## 示例排版
这是**不接模型**也能看见的回复样子。

- 第一点
- 第二点
- 第三点

一段 \`inline code\`。

` + "```" + `
function hello() {
  return "人设";
}
` + "```" + `

> 引用看起来会是这样。`;
const PRESETS = {
  deepseek: {
    label: "DeepSeek",
    base: "https://api.deepseek.com/v1",
    model: "deepseek-chat"
  },
  openai: {
    label: "OpenAI",
    base: "https://api.openai.com/v1",
    model: "gpt-4o-mini"
  },
  openrouter: {
    label: "OpenRouter",
    base: "https://openrouter.ai/api/v1",
    model: "deepseek/deepseek-chat"
  },
  groq: {
    label: "Groq",
    base: "https://api.groq.com/openai/v1",
    model: "llama-3.3-70b-versatile"
  },
  siliconflow: {
    label: "硅基流动",
    base: "https://api.siliconflow.cn/v1",
    model: "deepseek-ai/DeepSeek-V3"
  },
  moonshot: {
    label: "月之暗面 Kimi",
    base: "https://api.moonshot.cn/v1",
    model: "moonshot-v1-8k"
  },
  zhipu: {
    label: "智谱 GLM",
    base: "https://open.bigmodel.cn/api/paas/v4",
    model: "glm-4-flash"
  },
  custom: {
    label: "自定义（OpenAI 兼容）",
    base: "",
    model: ""
  }
};

const DEFAULT_SYSTEM = `你是入戏的角色扮演引擎。只输出 JSON，不要解释，不要 Markdown。
输出必须是数组，元素是场景模块。可用 type：
scene, call, wechat_private, wechat_group, wechat_sys, stamp, moments,
weibo_hot, weibo_post, douyin, sms, notice, order, stats, say, header
字段按已有协议：name/text/from/channel/status/items/comments/likes 等。
wechat_private 里用户刚发的话已经在界面上了，不要重复用户原句。
一次 1～4 个模块。对白短。数值变化时才出 stats，不要写加减原因。`;

const KEY = "ruxi.api.v1";

function loadCfg() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
  catch { return {}; }
}

function saveCfg(cfg) {
  localStorage.setItem(KEY, JSON.stringify(cfg));
}

function currentCfg() {
  return {
    preset: document.getElementById("api-preset").value,
    base: document.getElementById("api-base").value.trim().replace(/\/+$/, ""),
    model: document.getElementById("api-model").value.trim(),
    key: document.getElementById("api-key").value.trim(),
    proxy: document.getElementById("api-proxy").value.trim().replace(/\/+$/, ""),
    system: document.getElementById("api-system").value.trim() || DEFAULT_SYSTEM
  };
}

function applyCfg(cfg) {
  const p = cfg.preset && PRESETS[cfg.preset] ? cfg.preset : "deepseek";
  document.getElementById("api-preset").value = p;
  document.getElementById("api-base").value = cfg.base || PRESETS[p].base;
  document.getElementById("api-model").value = cfg.model || PRESETS[p].model;
  document.getElementById("api-key").value = cfg.key || "";
  document.getElementById("api-proxy").value = cfg.proxy || "";
  document.getElementById("api-system").value = cfg.system || DEFAULT_SYSTEM;
  refreshPill();
}

function refreshPill() {
  const cfg = currentCfg();
  const chip = document.getElementById("btn-model");
  if (!chip) return;
  chip.textContent = (cfg.base && cfg.model && cfg.key)
    ? (PRESETS[cfg.preset]?.label || cfg.model || "已接")
    : "未接模型";
}

function endpoint(cfg) {
  const path = cfg.base + "/chat/completions";
  if (!cfg.proxy) return path;
  return cfg.proxy + "/" + path.replace(/^https?:\/\//, "");
}

function extractBlocks(raw) {
  if (!raw) throw new Error("空回复");
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) s = fence[1].trim();
  const start = s.indexOf("[");
  const end = s.lastIndexOf("]");
  if (start >= 0 && end > start) s = s.slice(start, end + 1);
  const data = JSON.parse(s);
  const list = Array.isArray(data) ? data : [data];
  return list.filter(x => x && x.type);
}

async function chatCompletions(messages, extra = {}) {
  const cfg = currentCfg();
  if (!cfg.base || !cfg.model || !cfg.key) {
    throw new Error("先到「接口」页填完整地址、模型和 Key");
  }
  const url = endpoint(cfg);
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + cfg.key
  };
  if (cfg.preset === "openrouter") {
    headers["HTTP-Referer"] = location.origin || "https://ruxi.local";
    headers["X-Title"] = "入戏";
  }
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: cfg.model,
      temperature: 0.8,
      messages,
      ...extra
    })
  });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); }
  catch { throw new Error("接口不是 JSON：" + text.slice(0, 120)); }
  if (!res.ok) {
    const msg = body.error?.message || body.message || res.status + " " + res.statusText;
    throw new Error(msg);
  }
  const content = body.choices?.[0]?.message?.content;
  if (!content) throw new Error("没有 content 字段");
  return content;
}

function initApiPanel() {
  const sel = document.getElementById("api-preset");
  sel.innerHTML = Object.entries(PRESETS)
    .map(([k, v]) => `<option value="${k}">${v.label}</option>`).join("");
  applyCfg(loadCfg());

  sel.onchange = () => {
    const p = PRESETS[sel.value];
    if (sel.value !== "custom") {
      document.getElementById("api-base").value = p.base;
      document.getElementById("api-model").value = p.model;
    }
    refreshPill();
  };

  document.getElementById("btn-save-api").onclick = () => {
    const cfg = currentCfg();
    saveCfg(cfg);
    const x = extraState();
    const label = (document.getElementById("api-label")?.value || cfg.preset || "未命名").trim();
    const row = { id: cfg.preset + "-" + Date.now().toString(36), label, ...cfg };
    x.keys = (x.keys || []).filter(k => k.label !== label);
    x.keys.push(row);
    saveExtra(x);
    refreshPill();
    setApiStatus("已保存「" + label + "」", true);
  };
  document.getElementById("btn-clear-api").onclick = () => {
    document.getElementById("api-key").value = "";
    const cfg = currentCfg();
    saveCfg(cfg);
    refreshPill();
    setApiStatus("密钥已清除", true);
  };
  document.getElementById("btn-test-api").onclick = async () => {
    setApiStatus("在测…");
    try {
      const raw = await chatCompletions([
        { role: "system", content: "只回复 JSON 数组：[{\"type\":\"stamp\",\"text\":\"ok\"}]" },
        { role: "user", content: "ping" }
      ]);
      extractBlocks(raw);
      setApiStatus("通了，可以回舞台发消息", true);
    } catch (e) {
      setApiStatus(explainErr(e), false);
    }
  };
}

function setApiStatus(msg, ok) {
  const el = document.getElementById("api-status");
  el.textContent = msg;
  el.className = "hint " + (ok === true ? "ok" : ok === false ? "bad" : "");
}

function explainErr(e) {
  const m = String(e.message || e);
  if (/Failed to fetch|NetworkError|CORS/i.test(m)) {
    return "被浏览器跨域拦住了。换 OpenRouter、加中转，或不要用 file:// 直接打开。";
  }
  return m;
}

function readyForModel() {
  const c = currentCfg();
  return !!(c.base && c.model && c.key);
}
const STORE = "ruxi.threads.v2";
const streamEl = document.getElementById("stream");
const callLayer = document.getElementById("call-layer");

const PROJECTS = [
  { id: "work", name: "干活" },
  { id: "rp", name: "人设" },
  { id: "chat", name: "闲聊" }
];

const SYSTEMS = {
  work: "你是实用助手。用中文直接帮用户把事情做完：解释、步骤、草稿、修改。不要角色扮演，不要输出微博朋友圈卡片。不要输出 JSON。用普通句子回答。",
  chat: "你是轻松的聊天对象。用中文自然说话，短一点。不要办公腔，不要角色扮演，不要输出 JSON 或社交软件卡片。",
  rp: `你是角色扮演引擎。只输出 JSON 数组，不要解释。元素 type 可以是：
call, wechat_private, wechat_group, wechat_sys, stamp, moments,
weibo_hot, weibo_post, douyin, sms, notice, order, stats, say, header
不要输出 scene。用户刚发的话已显示，不要重复。一次 1～4 个模块。对白短。`
};

let state = { project: "chat", threadId: null };

function loadDB() {
  try { return JSON.parse(localStorage.getItem(STORE)) || { threads: [] }; }
  catch { return { threads: [] }; }
}
function saveDB(db) { localStorage.setItem(STORE, JSON.stringify(db)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function threadsOf(pid) {
  return loadDB().threads.filter(t => t.project === pid)
    .sort((a, b) => (b.pinned?1:0) - (a.pinned?1:0) || b.updated - a.updated);
}
function getThread(id) { return loadDB().threads.find(t => t.id === id); }
function upsertThread(th) {
  const db = loadDB();
  const i = db.threads.findIndex(t => t.id === th.id);
  if (i >= 0) db.threads[i] = th; else db.threads.unshift(th);
  saveDB(db);
}
function deleteThread(id) {
  const db = loadDB();
  db.threads = db.threads.filter(t => t.id !== id);
  saveDB(db);
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[m]));
}

function setPlus() {
  const on = state.project === "rp";
  document.getElementById("btn-plus").hidden = !on;
  if (!on) document.getElementById("insert-bar").hidden = true;
  document.body.dataset.mode = on ? "phone" : "box";
  renderPromptChips();
}

function renderProjTabs() {
  const box = document.getElementById("proj-tabs");
  box.innerHTML = PROJECTS.map(p =>
    `<button type="button" class="${p.id === state.project ? "on" : ""}" data-id="${p.id}">${p.name}</button>`
  ).join("");
  box.querySelectorAll("button").forEach(btn => {
    btn.onclick = () => {
      state.project = btn.dataset.id;
      setPlus();
      renderProjTabs();
      renderThreadList();
    };
  });
}

function renderThreadList() {
  const q = (document.getElementById("thread-search")?.value || "").trim().toLowerCase();
  let list = threadsOf(state.project);
  if (q) list = list.filter(t => (t.title || "").toLowerCase().includes(q) || JSON.stringify(t.items || []).toLowerCase().includes(q));
  const box = document.getElementById("thread-list");
  if (!list.length) {
    box.innerHTML = `<p class="empty">这个项目还没有窗口。</p>`;
    return;
  }
  box.innerHTML = list.map(t => `<div class="thread-row">
    <button type="button" class="thread" data-id="${t.id}">
      <strong>${t.pinned ? "钉 · " : ""}${escapeHtml(t.title)}</strong>
    </button>
    <button type="button" class="rename" data-pin="${t.id}">${t.pinned ? "取消钉" : "置顶"}</button>
    <button type="button" class="rename" data-dup="${t.id}">复制</button>
    <button type="button" class="rename" data-ren="${t.id}">改名</button>
    <button type="button" class="del" data-del="${t.id}">删除</button>
  </div>`).join("");
  box.querySelectorAll(".thread").forEach(btn => {
    btn.onclick = () => {
      openThread(btn.dataset.id);
      closeSheet("projects");
    };
  });
  box.querySelectorAll("[data-ren]").forEach(btn => {
    btn.onclick = () => renameThread(btn.dataset.ren);
  });
  box.querySelectorAll("[data-pin]").forEach(btn => {
    btn.onclick = () => {
      const th = getThread(btn.dataset.pin);
      if (!th) return;
      th.pinned = !th.pinned;
      upsertThread(th);
      renderThreadList();
    };
  });
  box.querySelectorAll("[data-dup]").forEach(btn => {
    btn.onclick = () => {
      const th = getThread(btn.dataset.dup);
      if (!th) return;
      const copy = JSON.parse(JSON.stringify(th));
      copy.id = uid();
      copy.title = (th.title || "窗口") + " 副本";
      copy.pinned = false;
      copy.updated = Date.now();
      upsertThread(copy);
      renderThreadList();
    };
  });
  box.querySelectorAll(".del").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.del;
      deleteThread(id);
      if (state.threadId === id) newThread(false);
      renderThreadList();
    };
  });
}


function renameThread(id) {
  const th = getThread(id);
  if (!th) return;
  const name = prompt("窗口名字", th.title);
  if (!name || !name.trim()) return;
  th.title = name.trim().slice(0, 24);
  th.updated = Date.now();
  upsertThread(th);
  if (state.threadId === id) document.getElementById("chat-title").textContent = th.title;
  renderThreadList();
}

function newThread(close = true) {
  const th = { id: uid(), project: state.project, title: "新窗口", items: [], updated: Date.now() };
  upsertThread(th);
  openThread(th.id);
  if (state.project === "rp") {
    const ch = extraState().chars.find(c => c.id === extraState().activeChar);
    if (ch && ch.greeting) add({ kind: "plain", me: false, text: ch.greeting });
  }
  renderThreadList();
  if (close) closeSheet("projects");
}

function openThread(id) {
  const th = getThread(id);
  if (!th) return;
  state.threadId = id;
  state.project = th.project;
  document.getElementById("chat-title").textContent = th.title;
  setPlus();
  streamEl.innerHTML = "";
  (th.items || []).forEach(draw);
  refreshEmpty();
  streamEl.scrollTop = streamEl.scrollHeight;
}

function refreshEmpty() {
  const hint = document.getElementById("empty-hint");
  if (!hint) return;
  const empty = !streamEl.children.length;
  hint.hidden = !empty;
  hint.textContent = {
    work: "干活窗口。点右上角「示例」看排版，或直接打字。",
    chat: "闲聊窗口。点「示例」看气泡长什么样。",
    rp: "人设窗口。点 + 插入微博/来电，或点「示例」。"
  }[state.project] || "";
}

function draw(item) {
  if (item.kind === "plain") {
    streamEl.insertAdjacentHTML("beforeend",
      `<article class="wx-msg ${item.me ? "me" : ""}"><div class="bubble">${item.me ? escapeHtml(item.text) : md(item.text)}</div></article>`);
  } else {
    streamEl.insertAdjacentHTML("beforeend", renderBlock(item));
  }
}

function add(item) {
  draw(item);
  refreshEmpty();
  streamEl.scrollTop = streamEl.scrollHeight;
  const th = getThread(state.threadId);
  if (!th) return;
  th.items.push(item);
  th.updated = Date.now();
  if (th.title === "新窗口" && item.kind === "plain" && item.me) {
    th.title = item.text.slice(0, 16);
    document.getElementById("chat-title").textContent = th.title;
  }
  upsertThread(th);
}

function historyFromThread() {
  const th = getThread(state.threadId);
  const sys = state.project === "rp" ? rpSystem() : (SYSTEMS[state.project] || SYSTEMS.chat);
  const msgs = [{ role: "system", content: sys }];
  (th.items || []).forEach(it => {
    if (it.kind === "plain" && it.me) msgs.push({ role: "user", content: it.text });
    else if (it.kind === "plain") msgs.push({ role: "assistant", content: it.text });
    else msgs.push({ role: "assistant", content: JSON.stringify(it) });
  });
  return msgs;
}

function closeSheet(id) { document.getElementById("sheet-" + id).hidden = true; }
function openSheet(id) { document.getElementById("sheet-" + id).hidden = false; }

initApiPanel();
renderPromptChips();

const last = loadDB().threads.sort((a, b) => b.updated - a.updated)[0];
if (last) openThread(last.id);
else newThread(false);

function renderRpTools() {
  const box = document.getElementById("rp-tools");
  box.hidden = state.project !== "rp";
  if (state.project !== "rp") return;
  const x = extraState();
  const rules = document.getElementById("rule-list");
  rules.innerHTML = (x.rules || []).map(r => `<div class="thread-row">
    <button type="button" class="thread ${r.on ? "on" : ""}" data-rtog="${r.id}"><strong>${r.on ? "开" : "关"} · ${escapeHtml(r.title)}</strong></button>
    <button type="button" class="rename" data-rup="${r.id}">上</button>
    <button type="button" class="rename" data-rdown="${r.id}">下</button>
    <button type="button" class="rename" data-redit="${r.id}">改</button>
    <button type="button" class="del" data-rdel="${r.id}">删除</button>
  </div>`).join("") || `<p class="empty">还没有规则。</p>`;
  rules.querySelectorAll("[data-rtog]").forEach(b => b.onclick = () => { toggleRule(b.dataset.rtog); renderRpTools(); });
  rules.querySelectorAll("[data-redit]").forEach(b => b.onclick = () => openRule(b.dataset.redit));
  rules.querySelectorAll("[data-rdel]").forEach(b => b.onclick = () => { deleteRule(b.dataset.rdel); renderRpTools(); });
  rules.querySelectorAll("[data-rup]").forEach(b => b.onclick = () => { moveRule(b.dataset.rup, -1); renderRpTools(); });
  rules.querySelectorAll("[data-rdown]").forEach(b => b.onclick = () => { moveRule(b.dataset.rdown, 1); renderRpTools(); });
  const list = document.getElementById("char-list");
  if (!x.chars.length) {
    list.innerHTML = `<p class="empty">还没有角色卡。</p>`;
    return;
  }
  list.innerHTML = x.chars.map(c => `<div class="thread-row">
    <button type="button" class="thread ${c.id === x.activeChar ? "on" : ""}" data-cid="${c.id}"><strong>${escapeHtml(c.name)}</strong></button>
    <button type="button" class="rename" data-cedit="${c.id}">改</button>
    <button type="button" class="del" data-cdel="${c.id}">删除</button>
  </div>`).join("");
  list.querySelectorAll("[data-cid]").forEach(btn => btn.onclick = () => { setActiveChar(btn.dataset.cid); renderRpTools(); });
  list.querySelectorAll("[data-cedit]").forEach(btn => btn.onclick = () => openChar(btn.dataset.cedit));
  list.querySelectorAll("[data-cdel]").forEach(btn => btn.onclick = () => { deleteChar(btn.dataset.cdel); renderRpTools(); });
}

document.getElementById("btn-projects").onclick = () => {
  renderProjTabs();
  renderRpTools();
  renderPrompts();
  renderThreadList();
  openSheet("projects");
};
document.getElementById("btn-new-thread").onclick = () => newThread(true);
document.getElementById("btn-new-in-chat").onclick = () => newThread(true);

document.querySelectorAll("[data-close]").forEach(el => {
  el.onclick = () => closeSheet(el.dataset.close);
});

const INSERTS = [
  ["来电", null],
  ["微博热搜", QUICK[0][1]],
  ["微博正文", QUICK[3][1]],
  ["朋友圈", DEMO_STREAM[3]],
  ["私聊", QUICK[4][1]],
  ["群聊", { type: "wechat_group", name: "海口同城会", text: "今晚别出门，秀英风已经很大了" }],
  ["抖音", QUICK[2][1]],
  ["短信", QUICK[1][1]],
  ["外卖", DEMO_STREAM[9]],
  ["状态", { type: "stats", items: [{ name: "信任", value: 37 }, { name: "恐惧", value: 54 }] }]
];
const insertBar = document.getElementById("insert-bar");
INSERTS.forEach(([label, item]) => {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = label;
  b.onclick = () => {
    if (label === "来电") callLayer.hidden = false;
    else add(item);
    insertBar.hidden = true;
  };
  insertBar.appendChild(b);
});
document.getElementById("btn-plus").onclick = () => {
  if (state.project !== "rp") return;
  insertBar.hidden = !insertBar.hidden;
};

function fillModelList() {
  const box = document.getElementById("model-list");
  const cur = currentCfg().preset;
  box.innerHTML = "";
  const keys = extraState().keys || [];
  const kl = document.getElementById("key-list");
  const active = extraState().activeKey;
  if (!keys.length) kl.innerHTML = `<p class="empty">还没有保存的钥匙。</p>`;
  else kl.innerHTML = keys.map(row => `<div class="thread-row">
    <button type="button" class="thread ${row.id === active ? "on" : ""}" data-kid="${row.id}"><strong>${escapeHtml(row.label)}</strong><span>${escapeHtml(row.model || row.preset || "")}</span></button>
    <button type="button" class="rename" data-kedit="${row.id}">改</button>
    <button type="button" class="del" data-kdel="${row.id}">删除</button>
  </div>`).join("");
  kl.querySelectorAll("[data-kid]").forEach(b => b.onclick = () => {
    const row = extraState().keys.find(k => k.id === b.dataset.kid);
    if (!row) return;
    applyCfg(row);
    if (document.getElementById("api-label")) document.getElementById("api-label").value = row.label || "";
    saveCfg(currentCfg());
    setActiveKey(row.id);
    refreshPill();
    closeSheet("model");
  });
  kl.querySelectorAll("[data-kedit]").forEach(b => {
    b.onclick = () => {
      const row = extraState().keys.find(k => k.id === b.dataset.kedit);
      if (!row) return;
      applyCfg(row);
      document.getElementById("api-label").value = row.label || "";
      closeSheet("model");
      openSheet("api");
    };
  });
  kl.querySelectorAll("[data-kdel]").forEach(b => {
    b.onclick = () => { deleteKey(b.dataset.kdel); fillModelList(); refreshPill(); };
  });
  Object.entries(PRESETS).forEach(([k, v]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = v.label;
    if (k === cur) b.classList.add("on");
    b.onclick = () => {
      document.getElementById("api-preset").value = k;
      document.getElementById("api-preset").dispatchEvent(new Event("change"));
      saveCfg(currentCfg());
      refreshPill();
      fillModelList();
    };
    box.appendChild(b);
  });
}
document.getElementById("btn-model").onclick = () => { fillModelList(); openSheet("model"); };
document.getElementById("btn-open-api").onclick = () => { closeSheet("model"); openSheet("api"); };

let pending = [];
let webOn = false;
document.getElementById("btn-web").onclick = () => {
  webOn = !webOn;
  document.getElementById("btn-web").classList.toggle("on", webOn);
};

function renderPending() {
  const box = document.getElementById("attach-preview");
  if (!pending.length) { box.hidden = true; box.innerHTML = ""; return; }
  box.hidden = false;
  box.innerHTML = pending.map((f, i) => f.thumb
    ? `<img src="${f.thumb}" alt="">`
    : `<span class="chip">${escapeHtml(f.name)}</span>`).join("");
}

document.getElementById("btn-file").onclick = () => document.getElementById("file-input").click();
document.getElementById("file-input").onchange = async e => {
  for (const file of [...e.target.files]) {
    const item = { name: file.name, type: file.type, text: "", data: "", thumb: "" };
    if (file.type.startsWith("image/")) {
      const url = await new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(file); });
      item.data = url; item.thumb = url;
    } else if (file.size < 200000 && /text|json|csv|markdown/.test(file.type + file.name)) {
      item.text = await file.text();
    } else {
      item.text = "（已附文件 " + file.name + "，前端无法解析内容）";
    }
    pending.push(item);
  }
  e.target.value = "";
  renderPending();
};

async function webSearch(q) {
  const url = "https://zh.wikipedia.org/w/api.php?action=opensearch&limit=5&namespace=0&origin=*&search=" + encodeURIComponent(q);
  const res = await fetch(url);
  const data = await res.json();
  const titles = data[1] || [], descs = data[2] || [], links = data[3] || [];
  if (!titles.length) return "";
  return titles.map((t, i) => `- ${t}：${descs[i] || ""} ${links[i] || ""}`).join("\n");
}

const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null, recOn = false;
if (SpeechRec) {
  rec = new SpeechRec();
  rec.lang = "zh-CN";
  rec.interimResults = false;
  rec.onresult = ev => {
    const said = ev.results[0][0].transcript;
    const input = document.getElementById("user-input");
    input.value = (input.value + " " + said).trim();
  };
  rec.onend = () => {
    recOn = false;
    document.getElementById("btn-mic").classList.remove("rec");
  };
}
document.getElementById("btn-mic").onclick = () => {
  if (!rec) { alert("这台浏览器不支持语音识别，iPhone 请用 Safari。"); return; }
  if (recOn) { rec.stop(); return; }
  recOn = true;
  document.getElementById("btn-mic").classList.add("rec");
  rec.start();
};

document.getElementById("composer").onsubmit = async e => {
  e.preventDefault();
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text && !pending.length) return;
  const files = pending.slice();
  pending = [];
  renderPending();
  const show = text + (files.length ? "\n" + files.map(f => "[附件: " + f.name + "]").join(" ") : "");
  add({ kind: "plain", me: true, text: show, files });
  input.value = "";
  insertBar.hidden = true;

  if (!readyForModel()) {
    const fallback = {
      work: "还没接模型。点左下角模型名称填 Key。",
      chat: "先聊着。接上模型之后就会正经回你。",
      rp: "模型还没接。点 + 可以先插入微博、来电、朋友圈。"
    }[state.project];
    setTimeout(() => add({ kind: "plain", me: false, text: fallback }), 300);
    return;
  }

  const btn = document.querySelector(".composer [type=submit]");
  btn.disabled = true;
  try {
    let extra = "";
    if (webOn && text) {
      try { extra = await webSearch(text); } catch {}
      if (extra) extra = "\n\n参考搜索：\n" + extra;
    }
    const msgs = historyFromThread().slice(-16);
    const last = msgs[msgs.length - 1];
    if (last && last.role === "user") {
      const imgs = files.filter(f => f.data);
      const bits = files.filter(f => f.text).map(f => "文件 " + f.name + ":\n" + f.text.slice(0, 4000));
      const body = (typeof last.content === "string" ? last.content : "") + extra + (bits.length ? "\n" + bits.join("\n") : "");
      if (imgs.length) {
        last.content = [{ type: "text", text: body || "请看图" }].concat(
          imgs.map(f => ({ type: "image_url", image_url: { url: f.data } }))
        );
      } else last.content = body;
    }
    const raw = await chatCompletions(msgs);
    if (state.project === "rp") {
      try { extractBlocks(raw).forEach(add); }
      catch { add({ kind: "plain", me: false, text: raw }); }
    } else {
      add({ kind: "plain", me: false, text: raw });
    }
  } catch (err) {
    add({ kind: "plain", me: false, text: "接口失败 · " + explainErr(err) });
  } finally {
    btn.disabled = false;
  }
};

document.getElementById("btn-decline").onclick = () => {
  callLayer.hidden = true;
  add({ type: "call", from: "海口同城会", channel: "微信视频", status: "已拒绝" });
};
document.getElementById("btn-accept").onclick = () => {
  callLayer.hidden = true;
  add({ type: "stamp", text: "通话中 00:12" });
  add({ type: "say", name: "海口同城会", said: "你窗户那侧进没进水？", thought: null });
};

document.getElementById("chat-title").onclick = () => {
  if (state.threadId) renameThread(state.threadId);
};

let editingRule = null;
function openRule(id) {
  const x = extraState();
  const r = x.rules.find(v => v.id === id) || { id: uid(), on: true, title: "", text: "" };
  editingRule = r.id;
  document.getElementById("rule-title").value = r.title || "";
  document.getElementById("rule-text").value = r.text || "";
  document.getElementById("rule-sheet-title").textContent = r.title ? "改规则" : "新规则";
  openSheet("rule");
}
document.getElementById("btn-new-rule").onclick = () => openRule(uid());
document.getElementById("btn-save-rule").onclick = () => {
  upsertRule({
    id: editingRule || uid(),
    on: true,
    title: document.getElementById("rule-title").value.trim() || "未命名",
    text: document.getElementById("rule-text").value.trim()
  });
  closeSheet("rule");
  renderRpTools();
};
let editingChar = null;
function openChar(id) {
  const x = extraState();
  const c = x.chars.find(v => v.id === id) || { id: id || uid(), name: "", persona: "", greeting: "", example: "" };
  editingChar = c.id;
  document.getElementById("char-name").value = c.name || "";
  document.getElementById("char-persona").value = c.persona || "";
  document.getElementById("char-greeting").value = c.greeting || "";
  document.getElementById("char-example").value = c.example || "";
  document.getElementById("char-sheet-title").textContent = c.name ? c.name : "新角色卡";
  openSheet("char");
}
document.getElementById("btn-new-char").onclick = () => openChar(uid());
document.getElementById("btn-save-char").onclick = () => {
  const name = document.getElementById("char-name").value.trim();
  if (!name) return;
  const ch = {
    id: editingChar || uid(),
    name,
    persona: document.getElementById("char-persona").value.trim(),
    greeting: document.getElementById("char-greeting").value.trim(),
    example: document.getElementById("char-example").value.trim()
  };
  upsertChar(ch);
  setActiveChar(ch.id);
  closeSheet("char");
  renderRpTools();
};
document.getElementById("thread-search").oninput = renderThreadList;
document.getElementById("btn-export").onclick = exportAll;
document.getElementById("btn-import").onclick = () => document.getElementById("import-file").click();
document.getElementById("import-file").onchange = async e => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    importAll(JSON.parse(await f.text()));
    location.reload();
  } catch { alert("导入失败"); }
};

document.getElementById("btn-demo").onclick = () => {
  if (state.project === "rp") {
    add(QUICK[0][1]);
    add(QUICK[4][1]);
    add({ type: "stats", items: [{ name: "信任", value: 41 }, { name: "心动", value: 28 }] });
  } else {
    add({ kind: "plain", me: false, text: DEMO_MD });
  }
};

function renderPrompts() {
  const box = document.getElementById("prompt-list");
  const list = extraState().prompts || [];
  if (!list.length) {
    box.innerHTML = `<p class="empty">提示词会插入输入框，不需要模型。</p>`;
    return;
  }
  box.innerHTML = list.map(pr => `<div class="thread-row">
    <button type="button" class="thread" data-puse="${pr.id}"><strong>${escapeHtml(pr.name)}</strong></button>
    <button type="button" class="rename" data-pedit="${pr.id}">改</button>
    <button type="button" class="del" data-pdel="${pr.id}">删除</button>
  </div>`).join("");
  box.querySelectorAll("[data-puse]").forEach(b => b.onclick = () => {
    const pr = extraState().prompts.find(x => x.id === b.dataset.puse);
    if (!pr) return;
    const input = document.getElementById("user-input");
    input.value = (input.value + " " + pr.body).trim();
    closeSheet("projects");
    input.focus();
  });
  box.querySelectorAll("[data-pedit]").forEach(b => b.onclick = () => openPrompt(b.dataset.pedit));
  box.querySelectorAll("[data-pdel]").forEach(b => b.onclick = () => { deletePrompt(b.dataset.pdel); renderPrompts(); renderPromptChips(); });
}
let editingPrompt = null;
function openPrompt(id) {
  const pr = extraState().prompts.find(x => x.id === id) || { id: id || uid(), name: "", body: "" };
  editingPrompt = pr.id;
  document.getElementById("prompt-name").value = pr.name || "";
  document.getElementById("prompt-body").value = pr.body || "";
  openSheet("prompt");
}
document.getElementById("btn-new-prompt").onclick = () => openPrompt(uid());
document.getElementById("btn-save-prompt").onclick = () => {
  const name = document.getElementById("prompt-name").value.trim();
  if (!name) return;
  upsertPrompt({
    id: editingPrompt || uid(),
    name,
    body: document.getElementById("prompt-body").value
  });
  closeSheet("prompt");
  renderPrompts();
  renderPromptChips();
};

function moveRule(id, dir) {
  const x = extraState();
  const i = x.rules.findIndex(r => r.id === id);
  if (i < 0) return;
  const j = i + dir;
  if (j < 0 || j >= x.rules.length) return;
  const t = x.rules[i];
  x.rules[i] = x.rules[j];
  x.rules[j] = t;
  saveExtra(x);
}
function renderPromptChips() {
  const box = document.getElementById("prompt-chips");
  if (!box) return;
  const list = extraState().prompts || [];
  if (!list.length) { box.innerHTML = ""; return; }
  box.innerHTML = list.map(pr => `<span class="chip-wrap">
      <button type="button" data-chip="${pr.id}">${escapeHtml(pr.name)}</button>
      <button type="button" class="chip-x" data-x="${pr.id}" aria-label="删除">×</button>
    </span>`).join("");
  box.querySelectorAll("[data-chip]").forEach(b => {
    b.onclick = () => {
      const pr = extraState().prompts.find(x => x.id === b.dataset.chip);
      if (!pr) return;
      const input = document.getElementById("user-input");
      input.value = (input.value + " " + pr.body).trim();
      input.focus();
    };
  });
  box.querySelectorAll("[data-x]").forEach(b => {
    b.onclick = ev => {
      ev.stopPropagation();
      deletePrompt(b.dataset.x);
      renderPromptChips();
      renderPrompts();
    };
  });
}

function pressTarget(e) {
  return e.target.closest("button, .project, .thread, .home-card, .set-row, .sidebar-item, .side-win, .menu-btn");
}
document.addEventListener("pointerdown", e => {
  const el = pressTarget(e);
  if (el) el.classList.add("pressed");
});
["pointerup", "pointercancel", "pointerleave"].forEach(ev => {
  document.addEventListener(ev, e => {
    document.querySelectorAll(".pressed").forEach(el => el.classList.remove("pressed"));
  });
});

document.addEventListener("touchmove", e => {
  if (e.target.closest(".stream, .sheet-card, textarea, input, .thread-list, .insert-bar, .prompt-chips")) return;
  e.preventDefault();
}, { passive: false });

function fitViewport() {
  const dock = document.querySelector(".dock");
  if (!dock || !window.visualViewport) return;
  const vv = window.visualViewport;
  const occluded = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
  dock.style.paddingBottom = (8 + occluded) + "px";
  document.getElementById("app").style.height = vv.height + "px";
  document.getElementById("app").style.top = vv.offsetTop + "px";
}
if (window.visualViewport) {
  visualViewport.addEventListener("resize", fitViewport);
  visualViewport.addEventListener("scroll", fitViewport);
  fitViewport();
}

const splash = document.getElementById("splash");
if (splash) {
  const closeSplash = () => { splash.classList.add("gone"); showHome(); };
  const enter = document.getElementById("splash-enter");
  if (enter) enter.addEventListener("click", ev => { ev.stopPropagation(); closeSplash(); });
  splash.addEventListener("click", closeSplash);
}


function setSidebar(on) {
  const bar = document.getElementById("sidebar");
  if (!bar) return;
  bar.hidden = !on;
  bar.classList.toggle("open", on);
  document.querySelectorAll(".menu-btn").forEach(b => b.classList.toggle("open", on));
  if (on) requestAnimationFrame(() => bar.classList.add("open"));
}
document.getElementById("btn-menu")?.addEventListener("click", () => setSidebar(true));
document.getElementById("btn-menu-chat")?.addEventListener("click", () => setSidebar(true));
document.getElementById("sidebar-bg")?.addEventListener("click", () => setSidebar(false));


function fillSideWins(pid) {
  const box = document.getElementById("side-wins-" + pid);
  if (!box) return;
  const list = threadsOf(pid);
  if (!list.length) {
    box.innerHTML = '<p class="empty" style="margin:4px 12px">还没有窗口</p>';
    return;
  }
  box.innerHTML = list.map(th =>
    '<button type="button" class="side-win" data-tid="' + th.id + '">' +
    (th.pinned ? "钉 · " : "") + escapeHtml(th.title || "新窗口") +
    "</button>"
  ).join("");
  box.querySelectorAll("[data-tid]").forEach(b => {
    b.onclick = () => {
      setSidebar(false);
      openThread(b.dataset.tid);
      document.getElementById("screen-home").classList.remove("on");
      document.getElementById("screen-chat").classList.add("on");
    };
  });
}
document.querySelectorAll("[data-toggle]").forEach(btn => {
  btn.onclick = () => {
    const pid = btn.dataset.toggle;
    const mod = btn.closest(".side-mod");
    const open = !mod.classList.contains("open");
    document.querySelectorAll(".side-mod").forEach(m => {
      m.classList.remove("open");
      const w = m.querySelector(".side-wins");
      if (w) w.hidden = true;
    });
    if (open) {
      mod.classList.add("open");
      const box = document.getElementById("side-wins-" + pid);
      box.hidden = false;
      fillSideWins(pid);
    }
  };
});
function showScreen(id) {
  ["screen-home", "screen-chat", "screen-settings", "screen-list"].forEach(s => {
    const el = document.getElementById(s);
    if (el) el.classList.toggle("on", s === id);
  });
}
document.getElementById("side-settings")?.addEventListener("click", () => {
  setSidebar(false);
  showScreen("screen-settings");
});
document.getElementById("btn-settings-back")?.addEventListener("click", () => showScreen("screen-home"));
document.getElementById("btn-list-back")?.addEventListener("click", () => showScreen("screen-home"));
document.querySelector("[data-go=list]")?.addEventListener("click", () => { showScreen("screen-list"); markTab("list"); renderList(); });
document.getElementById("side-list")?.addEventListener("click", () => { setSidebar(false); showScreen("screen-list"); markTab("list"); renderList(); });

document.getElementById("set-keys")?.addEventListener("click", () => {
  fillModelList();
  openSheet("model");
});
document.getElementById("set-export")?.addEventListener("click", () => exportAll());
document.getElementById("set-import")?.addEventListener("click", () => document.getElementById("import-file").click());
const _setSb = setSidebar;
setSidebar = function(on) {
  _setSb(on);
  if (on) document.querySelectorAll("[data-toggle]").forEach(b => {
    /* keep current open state */
  });
};


function markTab(pid) {
  document.querySelectorAll("#tabbar .tab").forEach(b => {
    b.classList.toggle("on", b.dataset.tab === pid);
  });
}
document.querySelectorAll("#tabbar .tab").forEach(b => {
  b.onclick = () => openProjectFromHome(b.dataset.tab);
});
const _open = openProjectFromHome;
openProjectFromHome = function(pid) {
  _open(pid);
  markTab(pid);
};
const _home = showHome;
showHome = function() {
  _home();
  document.querySelectorAll("#tabbar .tab").forEach(b => b.classList.remove("on"));
};


const LIST_KEY = "ruxi.list.v1";
function loadList() {
  try { return JSON.parse(localStorage.getItem(LIST_KEY)) || []; }
  catch { return []; }
}
function saveList(rows) { localStorage.setItem(LIST_KEY, JSON.stringify(rows)); }
function renderList() {
  const box = document.getElementById("list-box");
  if (!box) return;
  const rows = loadList();
  if (!rows.length) {
    box.innerHTML = '<p class="empty">还没有条目。</p>';
    return;
  }
  box.innerHTML = rows.map(r =>
    '<label class="list-row' + (r.done ? " done" : "") + '">' +
    '<input type="checkbox" data-lid="' + r.id + '"' + (r.done ? " checked" : "") + '>' +
    "<span>" + escapeHtml(r.text) + "</span>" +
    '<button type="button" class="x" data-ldel="' + r.id + '">×</button></label>'
  ).join("");
  box.querySelectorAll("[data-lid]").forEach(c => {
    c.onchange = () => {
      const rows = loadList();
      const it = rows.find(x => x.id === c.dataset.lid);
      if (it) { it.done = c.checked; saveList(rows); renderList(); }
    };
  });
  box.querySelectorAll("[data-ldel]").forEach(b => {
    b.onclick = ev => {
      ev.preventDefault();
      saveList(loadList().filter(x => x.id !== b.dataset.ldel));
      renderList();
    };
  });
}
document.getElementById("list-add")?.addEventListener("submit", e => {
  e.preventDefault();
  const input = document.getElementById("list-input");
  const text = (input.value || "").trim();
  if (!text) return;
  const rows = loadList();
  rows.unshift({ id: uid(), text, done: false });
  saveList(rows);
  input.value = "";
  renderList();
});
document.querySelectorAll("#tabbar .tab").forEach(b => {
  b.onclick = () => {
    if (b.dataset.tab === "list") {
      showScreen("screen-list");
      markTab("list");
      renderList();
    } else openProjectFromHome(b.dataset.tab);
  };
});
