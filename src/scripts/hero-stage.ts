import { gsap, reduceMotion } from './gsap'

/** Demo del hero: los comentarios caen al chat, vuelan a la fila de su dueño y Vendly los agrupa por persona. */

const stage = document.getElementById('stage')
const stageIn = document.getElementById('stageIn')
const feed = document.getElementById('feed')
const list = document.getElementById('hlist')

const AVATAR_COLORS = ['#e8546f', '#168581', '#6b6fd6', '#d2883a', '#4f9d69', '#b0579e', '#4f86c6', '#8a7c5a']
const avatarColor = (seed: string) => {
  let hash = 0
  for (const char of seed.toLowerCase()) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

interface Person {
  user: string
  name: string
  last: string
  count: number
}

const PEOPLE: Person[] = [
  { user: 'mari_ok', name: 'Marcela R.', last: 'quiero la M porfa', count: 3 },
  { user: 'jhon88', name: 'Jhon_88', last: 'cuánto la negra?', count: 2 },
  { user: 'luciap', name: 'Lucía P.', last: 'me la separas', count: 2 },
  { user: 'carlosv', name: 'Carlos V.', last: 'talla L', count: 1 },
  { user: 'anita.s', name: 'Ana S.', last: 'yo la azul', count: 1 },
  { user: 'dayana', name: 'Dayana', last: 'quién pidió??', count: 1 },
]

const EVENTS: [string, string][] = [
  ['mari_ok', 'quiero la M porfa'],
  ['jhon88', 'cuánto la negra?'],
  ['luciap', 'me la separas'],
  ['jhon88', 'talla M'],
  ['carlosv', 'L'],
  ['anita.s', 'yo la azul'],
  ['mari_ok', 'M'],
  ['dayana', 'pedido!!'],
  ['jhon88', 'M M M'],
  ['luciap', 'cuánto??'],
  ['carlosv', 'talla L'],
  ['mari_ok', 'la negra M'],
  ['dayana', 'quién pidió??'],
  ['anita.s', 'tienen en L?'],
]

const ROW_H = 54
const SLOT_H = 86
const SLOTS = 6
const STAGE_W = 700
/* Coordenadas del escenario: panel a x=280, y=20; cabecera+pestañas 84; padding 12; buscador 34; stats 20; gaps 8. */
const ROW_AVATAR_X = 280 + 12 + 1 + 12 + 16
const LIST_TOP = 20 + 84 + 12 + 34 + 8 + 20 + 8 + 1
const JITTER = [0, 18, 6, 26, 10, 22]

function init(stageEl: HTMLElement, stageInEl: HTMLElement, feedEl: HTMLElement, listEl: HTMLElement) {
  const counts = PEOPLE.map((p) => p.count)
  let order = PEOPLE.map((_, i) => i)
  let totalMessages = 10
  let orders = 0
  let owe = 0
  let eventIndex = 0
  let running = true
  const ordered = new Set<number>()
  const bubbles: { el: HTMLElement; slot: number }[] = []

  const msgsEl = document.getElementById('hMsgs')
  const ordersEl = document.getElementById('hOrders')
  const oweEl = document.getElementById('hOwe')
  const rows = Array.from(listEl.querySelectorAll<HTMLElement>('.hrow'))

  const fit = () => {
    const scale = stageEl.clientWidth / STAGE_W
    stageInEl.style.transform = `scale(${scale})`
  }
  fit()
  window.addEventListener('resize', fit)

  rows.forEach((row, i) => {
    const p = PEOPLE[i]
    row.innerHTML =
      `<span class="avatar" style="background:${avatarColor(p.user)}">${p.name[0]}</span>` +
      `<span class="row-main"><span class="row-title">${p.name} <span class="handle">@${p.user}</span></span>` +
      `<span class="row-sub">${p.last}</span></span>` +
      `<span class="counter">${p.count}</span>` +
      `<span class="act"><button class="btn btn-sm" tabindex="-1">+ Pedido</button><span class="pill pill-paid">✓ pedido</span></span>`
    gsap.set(row, { y: i * ROW_H })
    gsap.set(row.querySelector('.pill'), { opacity: 0 })
  })

  const rowOf = (personIndex: number) => rows[personIndex]
  const positionOf = (personIndex: number) => order.indexOf(personIndex)
  const setText = (el: Element | null, text: string) => {
    if (el) el.textContent = text
  }

  function makeBubble(user: string, text: string, index: number): HTMLElement {
    const el = document.createElement('div')
    el.className = 'bub'
    el.innerHTML =
      `<span class="av" style="background:${avatarColor(user)}">${user[0].toUpperCase()}</span>` +
      `<span class="meta"><span class="un">@${user}</span><span class="tx">${text}</span></span>`
    el.style.left = `${JITTER[index % JITTER.length]}px`
    feedEl.appendChild(el)
    return el
  }

  if (reduceMotion) {
    EVENTS.slice(0, 5).forEach(([user, text], i) => {
      const el = makeBubble(user, text, i)
      gsap.set(el, { y: (i + 1) * SLOT_H })
    })
    setText(msgsEl, String(totalMessages))
    stageInEl.style.opacity = '1'
    return
  }

  function land(personIndex: number, text: string) {
    counts[personIndex] += 1
    totalMessages += 1
    setText(msgsEl, String(totalMessages))
    const row = rowOf(personIndex)
    const counter = row.querySelector('.counter')
    setText(counter, String(counts[personIndex]))
    setText(row.querySelector('.row-sub'), text)
    gsap.fromTo(counter, { scale: 1.6 }, { scale: 1, duration: 0.45, ease: 'back.out(3)' })
    gsap.fromTo(row, { backgroundColor: '#ffe9ee' }, { backgroundColor: '#ffffff', duration: 1.1, immediateRender: false })

    order = [personIndex, ...order.filter((i) => i !== personIndex)]
    order.forEach((idx, position) => gsap.to(rowOf(idx), { y: position * ROW_H, duration: 0.5, ease: 'power3.out' }))
  }

  function placeOrder(personIndex: number) {
    if (ordered.has(personIndex)) return
    ordered.add(personIndex)
    const row = rowOf(personIndex)
    gsap.to(row.querySelector('.btn'), { opacity: 0, duration: 0.2 })
    gsap.to(row.querySelector('.pill'), { opacity: 1, duration: 0.3 })
    orders += 1
    const from = owe
    owe += 90
    const state = { v: from }
    setText(ordersEl, String(orders))
    gsap.to(state, {
      v: owe,
      duration: 0.7,
      ease: 'power2.out',
      onUpdate: () => setText(oweEl, `S/ ${state.v.toFixed(2)}`),
    })
    if (orders >= 4) {
      gsap.delayedCall(2.2, () => {
        ordered.clear()
        orders = 0
        owe = 0
        setText(ordersEl, '0')
        setText(oweEl, 'S/ 0.00')
        rows.forEach((row2) => {
          gsap.to(row2.querySelector('.btn'), { opacity: 1, duration: 0.3 })
          gsap.to(row2.querySelector('.pill'), { opacity: 0, duration: 0.3 })
        })
      })
    }
  }

  function step() {
    const [user, text] = EVENTS[eventIndex % EVENTS.length]
    const personIndex = PEOPLE.findIndex((p) => p.user === user)
    const index = eventIndex

    const el = makeBubble(user, text, index)
    const entry = { el, slot: SLOTS - 1 }
    gsap.fromTo(el, { y: entry.slot * SLOT_H + 28, opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' })
    bubbles.forEach((b) => {
      b.slot -= 1
      if (b.slot < 0) {
        gsap.to(b.el, { opacity: 0, duration: 0.25, onComplete: () => b.el.remove() })
      } else {
        gsap.to(b.el, { y: b.slot * SLOT_H, duration: 0.4, ease: 'power2.out' })
      }
    })
    bubbles.push(entry)
    while (bubbles.length && bubbles[0].slot < 0) bubbles.shift()
    gsap.to(el, { y: entry.slot * SLOT_H, duration: 0.01 })

    // el comentario viaja a la fila de su dueño
    const startX = JITTER[index % JITTER.length] + 120
    const startY = 20 + entry.slot * SLOT_H + 28
    const targetY = LIST_TOP + positionOf(personIndex) * ROW_H + ROW_H / 2
    const chip = document.createElement('span')
    chip.className = 'chip-fly'
    stageInEl.appendChild(chip)
    gsap.set(chip, { x: startX, y: startY, scale: 0.6, opacity: 1 })
    gsap.to(chip, { x: ROW_AVATAR_X, duration: 0.6, ease: 'power2.in' })
    gsap.to(chip, {
      y: targetY,
      scale: 1,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => {
        land(personIndex, text)
        gsap.to(chip, { scale: 2.2, opacity: 0, duration: 0.25, onComplete: () => chip.remove() })
      },
    })

    if (eventIndex % 5 === 4) gsap.delayedCall(0.9, () => placeOrder(personIndex))
    eventIndex += 1
  }

  function loop() {
    if (running && !document.hidden) step()
    gsap.delayedCall(running ? 0.85 : 0.4, loop)
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => entries.forEach((entry) => (running = entry.isIntersecting)), { threshold: 0.15 }).observe(stageEl)
  }

  gsap.fromTo(stageInEl, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.25 })
  gsap.delayedCall(0.9, loop)
}

if (stage && stageIn && feed && list) init(stage, stageIn, feed, list)
