<template>
  <div class="root" :data-mode="project === 'rp' ? 'phone' : 'box'">
    <div v-if="showSplash" id="splash" @click="enterApp">
      <div class="splash-orn splash-orn-tl"></div>
      <div class="splash-orn splash-orn-tr"></div>
      <div class="splash-orn splash-orn-bl"></div>
      <div class="splash-orn splash-orn-br"></div>
      <div class="splash-card">
        <svg class="splash-mark" viewBox="0 0 160 200" aria-hidden="true">
          <path d="M78 18h4v22h-4z" fill="#c9a3a8" />
          <rect x="52" y="38" width="56" height="88" rx="28" fill="#edcfd4" />
          <rect x="58" y="44" width="22" height="76" rx="4" fill="#f7e4e6" />
          <circle cx="76" cy="84" r="2.2" fill="#c4a574" />
          <ellipse cx="68" cy="148" rx="22" ry="26" fill="#f6f1ec" />
          <ellipse cx="56" cy="118" rx="7" ry="11" fill="#f6f1ec" />
          <ellipse cx="86" cy="132" rx="8" ry="6" fill="#f6f1ec" />
          <ellipse cx="60" cy="96" rx="5" ry="16" fill="#f6f1ec" />
          <ellipse cx="80" cy="98" rx="4.5" ry="15" fill="#f6f1ec" />
          <circle cx="63" cy="144" r="1.6" fill="#5a4450" />
          <circle cx="94" cy="168" r="7" fill="none" stroke="#c4a574" stroke-width="1.6" />
          <path d="M94 161v-8" stroke="#c4a574" stroke-width="1.4" fill="none" />
          <path d="M28 186h104" stroke="#e2c9c4" stroke-width="1" />
        </svg>
        <p class="splash-sign">门开了一条缝。</p>
        <button type="button" class="splash-enter" @click.stop="enterApp">进入</button>
      </div>
    </div>

    <section id="screen-chat" class="screen on">
      <header class="topbar">
        <div class="top-row">
          <button type="button" class="ghost" @click="sheet = 'projects'">项目</button>
          <div class="top-actions">
            <button type="button" class="ghost" @click="newThread">新开</button>
          </div>
        </div>
        <strong class="chat-title" @click="renameCurrent">{{ title }}</strong>
      </header>
      <main class="view on chat-main">
        <p v-if="!items.length" class="empty-hint">{{ emptyHint }}</p>
        <section class="stream" ref="stream">
          <article v-for="(it, i) in items" :key="i" class="wx-msg" :class="{ me: it.me }">
            <div class="bubble">{{ it.text }}</div>
          </article>
        </section>
      </main>
      <footer class="dock">
        <form class="composer" @submit.prevent="send">
          <input v-model="draft" autocomplete="off" placeholder="说一句…" />
          <button type="submit" class="send" aria-label="发送">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 19V5M12 5l-6.5 6.5M12 5l6.5 6.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </form>
      </footer>
    </section>

    <div v-if="sheet === 'projects'" class="sheet">
      <div class="sheet-bg" @click="sheet = ''"></div>
      <div class="sheet-card tall">
        <p class="sheet-title">项目</p>
        <div class="proj-tabs">
          <button
            v-for="p in projects"
            :key="p.id"
            type="button"
            :class="{ on: project === p.id }"
            @click="project = p.id"
          >{{ p.name }}</button>
        </div>
        <div class="row" style="margin:10px 0">
          <button type="button" class="primary sm" @click="newThread">新窗口</button>
        </div>
        <div class="thread-list">
          <p v-if="!threadList.length" class="empty">这个项目还没有窗口。</p>
          <div v-for="t in threadList" :key="t.id" class="thread-row">
            <button type="button" class="thread" @click="openThread(t.id); sheet = ''">
              <strong>{{ t.pinned ? '钉 · ' : '' }}{{ t.title }}</strong>
            </button>
            <button type="button" class="del" @click="removeThread(t.id)">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { PROJECTS, deleteThread, getThread, loadDB, threadsOf, uid, upsertThread } from './lib/store.js'

const showSplash = ref(true)
const sheet = ref('')
const project = ref('chat')
const threadId = ref(null)
const title = ref('新窗口')
const draft = ref('')
const items = ref([])
const stream = ref(null)
const projects = PROJECTS

const emptyHint = computed(() => ({
  work: '干活窗口。直接打字。',
  chat: '闲聊窗口。',
  rp: '人设窗口。'
}[project.value]))

const threadList = computed(() => threadsOf(project.value))

function enterApp() { showSplash.value = false }

function persistItems() {
  const th = getThread(threadId.value)
  if (!th) return
  th.items = items.value
  th.title = title.value
  th.updated = Date.now()
  upsertThread(th)
}

function openThread(id) {
  const th = getThread(id)
  if (!th) return
  threadId.value = th.id
  project.value = th.project
  title.value = th.title
  items.value = (th.items || []).map(it => ({
    kind: it.kind || 'plain',
    me: !!it.me,
    text: it.text || ''
  }))
  nextTick(() => { if (stream.value) stream.value.scrollTop = stream.value.scrollHeight })
}

function newThread() {
  const th = { id: uid(), project: project.value, title: '新窗口', items: [], updated: Date.now() }
  upsertThread(th)
  openThread(th.id)
  sheet.value = ''
}

function removeThread(id) {
  deleteThread(id)
  if (threadId.value === id) newThread()
}

function renameCurrent() {
  if (!threadId.value) return
  const name = prompt('窗口名字', title.value)
  if (!name || !name.trim()) return
  title.value = name.trim().slice(0, 24)
  persistItems()
}

function send() {
  const text = draft.value.trim()
  if (!text) return
  items.value.push({ kind: 'plain', me: true, text })
  if (title.value === '新窗口') title.value = text.slice(0, 16)
  draft.value = ''
  persistItems()
  const fallback = {
    work: '还没接模型。接口面板下一轮补进 Vue。',
    chat: '先聊着。模型面板下一轮迁过来。',
    rp: '模型还没接。人设卡片下一轮补进 Vue。'
  }[project.value]
  setTimeout(() => {
    items.value.push({ kind: 'plain', me: false, text: fallback })
    persistItems()
    nextTick(() => { if (stream.value) stream.value.scrollTop = stream.value.scrollHeight })
  }, 280)
}

onMounted(() => {
  const last = loadDB().threads.sort((a, b) => b.updated - a.updated)[0]
  if (last) openThread(last.id)
  else newThread()
})
</script>
