import { gsap, ScrollTrigger, reduceMotion } from './gsap'

/** "Cómo funciona": el scroll controla un live de ejemplo en el panel (chat → pedido → cobro → stock). */

interface HowStep {
  n: string
  t: string
  d: string
}

const pin = document.getElementById('howPin')
const stageEl = document.getElementById('howStage')
const howIn = document.getElementById('howIn')
const panel = document.getElementById('wp')
const steps = (window as unknown as { __howSteps?: HowStep[] }).__howSteps ?? []

const TOTAL = 19.5
/* El scroll arranca ya con las filas del chat en su sitio: sin tramo muerto al fijarse la sección. */
const T_START = 2.2
/* Segundo (de la línea de tiempo) en que arranca cada paso. */
const STEP_STARTS = [0, 4.4, 10, 15.5]
const SCROLL_LENGTH = '+=360%'

function setup(pinEl: HTMLElement, stageBox: HTMLElement, inner: HTMLElement, panelEl: HTMLElement) {
  const q = <T extends Element = HTMLElement>(sel: string) => panelEl.querySelector<T>(sel) as T

  const fit = () => {
    const scale = Math.min(stageBox.clientWidth / 420, stageBox.clientHeight / 560, 1.7)
    inner.style.width = `${420 * scale}px`
    inner.style.height = `${560 * scale}px`
    panelEl.style.transform = `scale(${scale})`
  }
  fit()
  window.addEventListener('resize', fit)

  const items = Array.from(document.querySelectorAll<HTMLElement>('.hstep'))
  const nowN = document.getElementById('nowN')
  const nowT = document.getElementById('nowT')
  const nowD = document.getElementById('nowD')
  const nowBox = document.getElementById('now')
  let current = 0

  const setStep = (index: number) => {
    if (index === current) return
    current = index
    items.forEach((el, i) => el.classList.toggle('is-active', i === index))
    const info = steps[index]
    if (info && nowN && nowT && nowD && nowBox) {
      gsap.fromTo(nowBox, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' })
      nowN.textContent = info.n
      nowT.textContent = info.t
      nowD.textContent = info.d
    }
  }

  if (reduceMotion) {
    items.forEach((el) => el.classList.add('is-active'))
    return
  }

  // posiciones (px nativos del panel) de lo que toca el cursor
  const rel = (el: HTMLElement) => {
    let x = 0
    let y = 0
    let node: HTMLElement | null = el
    while (node && node !== panelEl) {
      x += node.offsetLeft
      y += node.offsetTop
      node = node.offsetParent as HTMLElement | null
    }
    return { x: x + el.offsetWidth / 2, y: y + el.offsetHeight / 2 }
  }

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
  tl.to({}, { duration: TOTAL }, 0)

  const swap = (from: string, to: string, t: number) => {
    tl.set(from, { opacity: 0 }, t)
    tl.set(to, { opacity: 1 }, t)
  }
  const moveTo = (el: HTMLElement, t: number, duration: number) => {
    const p = rel(el)
    tl.to('#w-cur', { x: p.x, y: p.y, duration, ease: 'power2.inOut' }, t)
  }
  const click = (t: number) => {
    tl.fromTo('#w-ripple', { scale: 0.2, opacity: 0.8 }, { scale: 1.5, opacity: 0, duration: 0.45, ease: 'power2.out', immediateRender: false }, t)
    tl.fromTo('#w-curSvg', { scale: 1 }, { scale: 0.8, duration: 0.08, ease: 'power1.inOut', repeat: 1, yoyo: true, immediateRender: false }, t - 0.04)
  }

  // posiciones medidas con todo en su sitio
  const pBtn0 = q('#w-btn0')
  const pRes = q('#w-res1')
  const pChip = q('#w-chM')
  const pPlus = q('#w-plus')
  const pSave = q('#w-save')
  const pTabOrders = q('#w-tab-orders')
  const pTabCat = q('#w-tab-cat')

  // estados iniciales
  tl.set('#w-sheet', { yPercent: 100 }, 0)
  tl.set(['#w-toast', '#w-picked', '#w-done', '#w-reqB', '#w-qnB', '#w-hintB', '#w-saveB'], { opacity: 0 }, 0)
  tl.set('#w-cur', { x: 400, y: 440, opacity: 0 }, 0)

  // 01 · el chat, agrupado por persona
  tl.fromTo(panelEl.querySelectorAll('#w-chat .vp-row'), { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out', stagger: 0.18 }, 0.2)
  panelEl.querySelectorAll<HTMLElement>('.counter[data-n]').forEach((counter) => {
    const state = { v: 0 }
    const target = Number(counter.dataset.n)
    tl.to(state, { v: target, duration: 1.6, ease: 'power2.out', onUpdate: () => (counter.textContent = String(Math.round(state.v))) }, 0.4)
  })

  // 02 · un clic y es pedido
  tl.to('#w-cur', { opacity: 1, duration: 0.25 }, 3.0)
  moveTo(pBtn0, 3.1, 1.1)
  click(4.3)
  tl.to('#w-backdrop', { opacity: 1, duration: 0.3 }, 4.35)
  tl.to('#w-sheet', { yPercent: 0, duration: 0.55, ease: 'power3.out' }, 4.35)
  tl.fromTo('#w-stProduct', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 4.8)
  tl.fromTo('#w-stVariant', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 6.1)
  tl.fromTo('#w-stQty', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 7.2)

  moveTo(pRes, 5.2, 0.7)
  click(6.0)
  tl.to('#w-results', { opacity: 0, duration: 0.2 }, 6.05)
  tl.to('#w-picked', { opacity: 1, duration: 0.25 }, 6.05)
  tl.to('#w-slot', { height: 40, duration: 0.3, ease: 'power2.out' }, 6.1)

  moveTo(pChip, 6.3, 0.7)
  click(7.0)
  tl.to('#w-chM', { backgroundColor: '#ffe9ee', borderColor: '#fe2c55', color: '#fe2c55', duration: 0.18 }, 7.0)
  swap('#w-stVariant .req .a', '#w-reqB', 7.0)

  moveTo(pPlus, 7.4, 0.6)
  click(8.1)
  swap('#w-stQty .qn .a', '#w-qnB', 8.1)
  swap('#w-stQty .stock-hint .a', '#w-hintB', 8.1)
  swap('#w-save .a', '#w-saveB', 8.1)

  moveTo(pSave, 8.3, 0.7)
  click(9.0)
  tl.to('#w-save', { backgroundColor: '#23845a', duration: 0.15 }, 9.02)
  tl.to('#w-sheet', { yPercent: 100, duration: 0.45, ease: 'power3.in' }, 9.2)
  tl.to('#w-backdrop', { opacity: 0, duration: 0.3 }, 9.3)
  tl.fromTo('#w-toast', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.6)', immediateRender: false }, 9.6)
  tl.to('#w-toast', { opacity: 0, duration: 0.3 }, 10.4)
  tl.to('#w-btn0', { opacity: 0, duration: 0.2 }, 9.6)
  tl.to('#w-done', { opacity: 1, duration: 0.3 }, 9.65)
  tl.fromTo('#w-row0', { backgroundColor: '#e3f4ec' }, { backgroundColor: '#ffffff', duration: 0.9, immediateRender: false }, 9.6)

  // 03 · por cobrar y cobrado
  moveTo(pTabOrders, 10.0, 0.8)
  click(10.9)
  tl.to('#w-tabline', { x: 84, duration: 0.3, ease: 'power3.out' }, 10.95)
  tl.to('#w-chat', { opacity: 0, duration: 0.25 }, 10.95)
  tl.to('#w-orders', { opacity: 1, duration: 0.25 }, 11.0)
  tl.fromTo('#w-orders .summary', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, 11.1)
  const owe = { v: 0 }
  tl.to(owe, { v: 225, duration: 1.3, ease: 'power2.out', onUpdate: () => (q('#w-owe').textContent = `S/ ${owe.v.toFixed(2)}`) }, 11.2)
  tl.fromTo('#w-units', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, 11.7)
  tl.fromTo('#w-orders-list .o-row', { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out', stagger: 0.15 }, 12.2)

  // 04 · stock por talla
  moveTo(pTabCat, 15.4, 0.8)
  click(16.3)
  tl.to('#w-tabline', { x: 168, duration: 0.3, ease: 'power3.out' }, 16.35)
  tl.to('#w-orders', { opacity: 0, duration: 0.25 }, 16.35)
  tl.to('#w-cat', { opacity: 1, duration: 0.25 }, 16.4)
  tl.to('#w-cur', { opacity: 0, duration: 0.25 }, 16.7)
  tl.fromTo('#w-pc1', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, 16.5)
  tl.fromTo('#w-pc2', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, 16.8)
  tl.fromTo('#w-mSmall', { opacity: 0 }, { opacity: 1, duration: 0.3 }, 17.9)
  const stock = { v: 3 }
  tl.to(stock, { v: 1, duration: 0.6, onUpdate: () => (q('#w-mB').textContent = String(Math.round(stock.v))) }, 17.4)
  tl.to('#w-cellM', { boxShadow: '0 0 0 3px rgba(254,44,85,0.9)', duration: 0.35, repeat: 3, yoyo: true, ease: 'sine.inOut' }, 17.4)

  // se recorre una vez entera para que cada animación registre su estado inicial y los "set" del segundo 0 se apliquen
  tl.progress(1).progress(0)

  // el scroll recorre la línea de tiempo desde T_START
  const segments = Array.from(document.querySelectorAll<HTMLElement>('[data-seg]'))
  const fills = segments.map((seg) => seg.querySelector('i') as HTMLElement)
  const setFills = fills.map((el) => gsap.quickSetter(el, 'scaleX'))
  const hint = document.getElementById('hint')
  let hintShown = true

  const trigger = ScrollTrigger.create({
    trigger: pinEl,
    start: 'top top',
    end: SCROLL_LENGTH,
    pin: true,
    scrub: 0.6,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    animation: gsap.fromTo(tl, { time: T_START }, { time: TOTAL, ease: 'none' }),
    onUpdate: (self) => {
      const t = T_START + self.progress * (TOTAL - T_START)
      let index = 0
      STEP_STARTS.forEach((start, i) => {
        if (t >= start) index = i
      })
      setStep(index)
      STEP_STARTS.forEach((start, i) => {
        const end = STEP_STARTS[i + 1] ?? TOTAL
        const from = Math.max(start, T_START)
        setFills[i](Math.min(1, Math.max(0, (t - from) / (end - from))))
      })
      const showHint = self.progress < 0.03
      if (hint && showHint !== hintShown) {
        hintShown = showHint
        gsap.to(hint, { opacity: showHint ? 1 : 0, duration: 0.3 })
      }
    },
  })

  // cada segmento lleva a su paso
  const goTo = (index: number) => {
    const t = Math.max(STEP_STARTS[index], T_START + 0.01)
    const y = trigger.start + ((t - T_START) / (TOTAL - T_START)) * (trigger.end - trigger.start)
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
  segments.forEach((seg, i) => seg.addEventListener('click', () => goTo(i)))
  items.forEach((el, i) => {
    el.addEventListener('click', () => goTo(i))
    el.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        goTo(i)
      }
    })
  })

  // el panel entra con la sección, antes de fijarse
  gsap.fromTo(
    inner,
    { opacity: 0, y: 60 },
    { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: pinEl, start: 'top 80%', once: true } },
  )

  ScrollTrigger.addEventListener('refreshInit', fit)
}

if (pin && stageEl && howIn && panel) {
  document.fonts.ready.then(() => setup(pin, stageEl, howIn, panel))
}
