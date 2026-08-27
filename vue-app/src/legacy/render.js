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
