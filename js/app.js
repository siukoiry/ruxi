const streamEl = document.getElementById("stream");
const kitEl = document.getElementById("kit-list");
const jsonBox = document.getElementById("json-box");
const callLayer = document.getElementById("call-layer");
const history = [{ role: "system", content: "" }];

initApiPanel();
history[0].content = currentCfg().system || DEFAULT_SYSTEM;

function mount(el, items) {
  el.innerHTML = items.map(renderBlock).join("");
  el.scrollTop = el.scrollHeight;
}

function add(item) {
  streamEl.insertAdjacentHTML("beforeend", renderBlock(item));
  streamEl.parentElement.scrollTo({ top: 99999, behavior: "smooth" });
}

document.querySelectorAll(".tabs button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("on"));
    btn.classList.add("on");
    document.querySelectorAll(".view").forEach(v => v.classList.remove("on"));
    document.getElementById("view-" + btn.dataset.tab).classList.add("on");
  };
});

mount(streamEl, DEMO_STREAM);
mount(kitEl, [
  DEMO_STREAM[0],
  { type: "call", from: "海口同城会", channel: "微信视频", status: "响铃中" },
  { type: "wechat_private", name: "海口同城会", text: "今晚别出门" },
  { type: "wechat_private", me: true, name: "我", text: "窗户已经扣上了" },
  DEMO_STREAM[3],
  DEMO_STREAM[2],
  DEMO_STREAM[10],
  DEMO_STREAM[11],
  { type: "sms", from: "10086", text: "秀英区部分基站受台风影响短暂中断，预计今夜恢复。" }
]);

jsonBox.value = JSON.stringify(DEMO_JSON, null, 2);

document.getElementById("btn-fill-demo").onclick = () => {
  jsonBox.value = JSON.stringify(DEMO_JSON, null, 2);
};

document.getElementById("btn-render-json").onclick = () => {
  try {
    const data = JSON.parse(jsonBox.value);
    const list = Array.isArray(data) ? data : [data];
    mount(streamEl, list);
    document.querySelector('[data-tab="stage"]').click();
  } catch (e) {
    jsonBox.style.borderColor = "#e6162d";
    setTimeout(() => { jsonBox.style.borderColor = ""; }, 800);
  }
};

const quick = document.getElementById("quick");
QUICK.forEach(([label, item]) => {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = label;
  b.onclick = () => add(item);
  quick.appendChild(b);
});

document.getElementById("composer").onsubmit = async e => {
  e.preventDefault();
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) return;
  add({ type: "wechat_private", me: true, name: "我", text });
  input.value = "";

  if (!readyForModel()) {
    setTimeout(() => {
      add({ type: "wechat_private", name: "海口同城会", text: "先别下楼，风口在走廊。" });
      add({ type: "stats", items: [{ name: "信任", value: 44 }, { name: "恐惧", value: 51 }] });
    }, 400);
    return;
  }

  history[0].content = currentCfg().system || DEFAULT_SYSTEM;
  history.push({ role: "user", content: text });
  const btn = document.querySelector(".composer button");
  btn.disabled = true;
  btn.textContent = "…";
  try {
    const raw = await chatCompletions(history.slice(-12));
    const blocks = extractBlocks(raw);
    blocks.forEach(add);
    history.push({ role: "assistant", content: raw });
  } catch (err) {
    add({ type: "header", text: "接口失败 · " + explainErr(err) });
  } finally {
    btn.disabled = false;
    btn.textContent = "发送";
  }
};

document.getElementById("btn-call-demo").onclick = () => {
  callLayer.hidden = false;
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
