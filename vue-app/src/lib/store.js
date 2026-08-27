export const STORE = 'ruxi.threads.v2'
export const PROJECTS = [
  { id: 'work', name: '干活' },
  { id: 'rp', name: '人设' },
  { id: 'chat', name: '闲聊' }
]

export function loadDB() {
  try { return JSON.parse(localStorage.getItem(STORE)) || { threads: [] } }
  catch { return { threads: [] } }
}
export function saveDB(db) {
  localStorage.setItem(STORE, JSON.stringify(db))
}
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}
export function threadsOf(pid) {
  return loadDB().threads.filter(t => t.project === pid)
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.updated - a.updated)
}
export function getThread(id) {
  return loadDB().threads.find(t => t.id === id)
}
export function upsertThread(th) {
  const db = loadDB()
  const i = db.threads.findIndex(t => t.id === th.id)
  if (i >= 0) db.threads[i] = th
  else db.threads.unshift(th)
  saveDB(db)
}
export function deleteThread(id) {
  const db = loadDB()
  db.threads = db.threads.filter(t => t.id !== id)
  saveDB(db)
}
