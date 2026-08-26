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
  const pill = document.getElementById("api-pill");
  if (cfg.base && cfg.model && cfg.key) {
    const name = PRESETS[cfg.preset]?.label || "自定义";
    pill.textContent = name;
    pill.className = "pill on";
  } else {
    pill.textContent = "未接模型";
    pill.className = "pill off";
  }
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
    saveCfg(currentCfg());
    refreshPill();
    setApiStatus("已保存到本机", true);
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
