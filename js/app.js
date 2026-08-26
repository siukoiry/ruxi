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
  return loadDB().threads.filter(t => t.project === pid).sort((a, b) => b.updated - a.updated);
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
  const list = threadsOf(state.project);
  const box = document.getElementById("thread-list");
  if (!list.length) {
    box.innerHTML = `<p class="empty">这个项目还没有窗口。</p>`;
    return;
  }
  box.innerHTML = list.map(t => `<div class="thread-row">
    <button type="button" class="thread" data-id="${t.id}">
      <strong>${escapeHtml(t.title)}</strong>
    </button>
    <button type="button" class="del" data-del="${t.id}">删除</button>
  </div>`).join("");
  box.querySelectorAll(".thread").forEach(btn => {
    btn.onclick = () => {
      openThread(btn.dataset.id);
      closeSheet("projects");
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

function newThread(close = true) {
  const th = { id: uid(), project: state.project, title: "新窗口", items: [], updated: Date.now() };
  upsertThread(th);
  openThread(th.id);
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
  streamEl.scrollTop = streamEl.scrollHeight;
}

function draw(item) {
  if (item.kind === "plain") {
    streamEl.insertAdjacentHTML("beforeend",
      `<article class="wx-msg ${item.me ? "me" : ""}"><div class="bubble">${escapeHtml(item.text)}</div></article>`);
  } else {
    streamEl.insertAdjacentHTML("beforeend", renderBlock(item));
  }
}

function add(item) {
  draw(item);
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
  const sys = SYSTEMS[state.project] || SYSTEMS.chat;
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

const last = loadDB().threads.sort((a, b) => b.updated - a.updated)[0];
if (last) openThread(last.id);
else newThread(false);

document.getElementById("btn-projects").onclick = () => {
  renderProjTabs();
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

document.getElementById("composer").onsubmit = async e => {
  e.preventDefault();
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) return;
  add({ kind: "plain", me: true, text });
  input.value = "";
  insertBar.hidden = true;

  if (!readyForModel()) {
    const fallback = {
      work: "还没接模型。点输入框旁的模型名称填 Key。",
      chat: "先聊着。接上模型之后就会正经回你。",
      rp: "模型还没接。点 + 可以先插入微博、来电、朋友圈。"
    }[state.project];
    setTimeout(() => add({ kind: "plain", me: false, text: fallback }), 300);
    return;
  }

  const btn = document.querySelector(".composer [type=submit]");
  btn.disabled = true; btn.textContent = "…";
  try {
    const raw = await chatCompletions(historyFromThread().slice(-16));
    if (state.project === "rp") {
      try { extractBlocks(raw).forEach(add); }
      catch { add({ kind: "plain", me: false, text: raw }); }
    } else {
      add({ kind: "plain", me: false, text: raw });
    }
  } catch (err) {
    add({ kind: "plain", me: false, text: "接口失败 · " + explainErr(err) });
  } finally {
    btn.disabled = false; btn.textContent = "发送";
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
