const streamEl = document.getElementById("stream");
const callLayer = document.getElementById("call-layer");
const history = [{ role: "system", content: "" }];

initApiPanel();
history[0].content = currentCfg().system || DEFAULT_SYSTEM;

function add(item) {
  streamEl.insertAdjacentHTML("beforeend", renderBlock(item));
  streamEl.scrollTop = streamEl.scrollHeight;
}

function openSheet(id) {
  document.getElementById("sheet-" + id).hidden = false;
}
function closeSheet(id) {
  document.getElementById("sheet-" + id).hidden = true;
}

document.querySelectorAll("[data-close]").forEach(el => {
  el.onclick = () => closeSheet(el.dataset.close);
});

const INSERTS = [
  ["场景卡", DEMO_STREAM[0]],
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

document.getElementById("btn-model").onclick = () => {
  fillModelList();
  openSheet("model");
};
document.getElementById("btn-open-api").onclick = () => {
  closeSheet("model");
  openSheet("api");
};

add(DEMO_STREAM[0]);

document.getElementById("composer").onsubmit = async e => {
  e.preventDefault();
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) return;
  add({ type: "wechat_private", me: true, name: "我", text });
  input.value = "";
  insertBar.hidden = true;

  if (!readyForModel()) {
    setTimeout(() => {
      add({ type: "wechat_private", name: "海口同城会", text: "先别下楼，风口在走廊。" });
    }, 400);
    return;
  }

  history[0].content = currentCfg().system || DEFAULT_SYSTEM;
  history.push({ role: "user", content: text });
  const btn = document.querySelector(".composer [type=submit]");
  btn.disabled = true;
  btn.textContent = "…";
  try {
    const raw = await chatCompletions(history.slice(-12));
    extractBlocks(raw).forEach(add);
    history.push({ role: "assistant", content: raw });
  } catch (err) {
    add({ type: "header", text: "接口失败 · " + explainErr(err) });
  } finally {
    btn.disabled = false;
    btn.textContent = "发送";
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
