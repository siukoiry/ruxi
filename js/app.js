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
  return e.target.closest("button, .project, .thread");
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
