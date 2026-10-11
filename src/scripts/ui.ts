import { gsap, ScrollTrigger, reduceMotion } from './gsap'

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel))

/* ---------- toast ---------- */
let toastTimer = 0
function toast(message: string) {
  const el = $('#toast')
  if (!el) return
  el.textContent = message
  el.classList.add('is-on')
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => el.classList.remove('is-on'), 2800)
}

/* ---------- nav ---------- */
const nav = $('#nav')
const onScroll = () => nav?.classList.toggle('is-stuck', window.scrollY > 24)
window.addEventListener('scroll', onScroll, { passive: true })
onScroll()

/* ---------- compartir / copiar el enlace de la tienda ---------- */
const STORE = 'https://chromewebstore.google.com/detail/vendly/nhmlejopnhofdhipibokklbaiopceiio?hl=es'

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  }
}

$$('[data-share]').forEach((btn) =>
  btn.addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Vendly', text: 'Vendly: ordena el chat de tu live (Chrome, computadora)', url: STORE })
        return
      } catch {
        /* cancelado: se intenta copiar */
      }
    }
    const ok = await copyText(STORE)
    toast(ok ? 'Enlace copiado. Ábrelo en tu computadora.' : 'No se pudo copiar el enlace.')
  }),
)

/* ---------- contacto: copiar el correo y formulario ---------- */
const lead = (window as unknown as { __lead?: { email: string; key: string } }).__lead ?? { email: '', key: '' }

// El enlace mailto no hace nada si el equipo no tiene programa de correo: por eso, además, se copia la dirección.
$$('[data-copy-email]').forEach((el) =>
  el.addEventListener('click', async () => {
    const ok = await copyText(lead.email)
    toast(ok ? `Correo copiado: ${lead.email}` : lead.email)
  }),
)

const gmailUrl = (subject: string, body: string) =>
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(lead.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

const form = $<HTMLFormElement>('#leadForm')
form?.addEventListener('submit', async (event) => {
  event.preventDefault()
  const data = new FormData(form)
  const fullName = String(data.get('fullName') ?? '').trim()
  const contact = String(data.get('contact') ?? '').trim()
  const message = String(data.get('message') ?? '').trim()
  const err = $('#leadErr')
  const send = $<HTMLButtonElement>('#leadSend')
  if (!fullName || !contact || !message) {
    if (err) err.textContent = 'Completa tu nombre, cómo contactarte y qué necesitas.'
    return
  }
  if (err) err.textContent = ''

  const subject = `Proyecto: ${fullName}`
  const body = `Hola,

${message}

Me llamo ${fullName}. Me pueden contactar en: ${contact}

(Enviado desde la landing de Vendly)`

  // Sin servicio de formularios configurado: se abre Gmail con el mensaje listo.
  if (!lead.key) {
    window.open(gmailUrl(subject, body), '_blank', 'noopener')
    toast('Se abrió Gmail con tu mensaje. Revisa y envíalo.')
    return
  }

  if (send) {
    send.disabled = true
    send.textContent = 'Enviando…'
  }
  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: lead.key,
        subject,
        from_name: 'Landing de Vendly',
        name: fullName,
        contact,
        message,
        botcheck: data.get('botcheck') ? 'on' : '',
      }),
    })
    const result = (await response.json()) as { success?: boolean }
    if (!response.ok || !result.success) throw new Error('send failed')
    form.hidden = true
    const done = $('#leadOk')
    if (done) done.hidden = false
    form.reset()
  } catch {
    if (err) err.innerHTML = `No se pudo enviar. <a href="${gmailUrl(subject, body)}" target="_blank" rel="noopener" style="color:#fff">Envíalo desde Gmail</a> o escribe a ${lead.email}.`
  } finally {
    if (send) {
      send.disabled = false
      send.textContent = 'Enviar mensaje'
    }
  }
})

/* ---------- videos: se reproducen solo cuando se ven ---------- */
const videos = $$<HTMLVideoElement>('.phone video')
if (reduceMotion) {
  videos.forEach((v) => v.setAttribute('controls', ''))
} else if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        const v = entry.target as HTMLVideoElement
        if (entry.isIntersecting) {
          v.preload = 'auto'
          void v.play().catch(() => {})
        } else {
          v.pause()
        }
      }),
    { threshold: 0.55 },
  )
  videos.forEach((v) => io.observe(v))
}

/* ---------- animaciones de entrada ---------- */
function splitWords(el: Element) {
  const walk = (node: Node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment()
        ;(child.textContent ?? '').split(/(\s+)/).forEach((part) => {
          if (!part) return
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(' '))
            return
          }
          const w = document.createElement('span')
          w.className = 'w'
          const wi = document.createElement('span')
          wi.className = 'wi'
          wi.textContent = part
          w.appendChild(wi)
          frag.appendChild(w)
        })
        child.replaceWith(frag)
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child)
      }
    })
  }
  walk(el)
}

if (reduceMotion) {
  $$('[data-split]').forEach((el) => el.classList.add('is-split'))
} else {
  $$('[data-split]').forEach((el) => {
    splitWords(el)
    el.classList.add('is-split')
    const words = $$('.wi', el)
    gsap.set(words, { yPercent: 115 })
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () =>
        gsap.to(words, { yPercent: 0, duration: 0.9, ease: 'power4.out', stagger: 0.055 }),
    })
  })

  const reveals = $$('[data-reveal]')
  gsap.set(reveals, { y: 28, opacity: 0 })
  ScrollTrigger.batch(reveals, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out', stagger: 0.09 }),
  })
}

/* ---------- contadores ---------- */
$$('[data-count]').forEach((el) => {
  const target = Number(el.dataset.count)
  const prefix = el.dataset.prefix ?? ''
  const decimals = Number(el.dataset.decimals ?? 0)
  if (reduceMotion) return
  const state = { v: 0 }
  el.textContent = `${prefix}${(0).toFixed(decimals)}`
  ScrollTrigger.create({
    trigger: el,
    start: 'top 88%',
    once: true,
    onEnter: () =>
      gsap.to(state, {
        v: target,
        duration: 1.6,
        ease: 'power3.out',
        onUpdate: () => {
          el.textContent = `${prefix}${state.v.toFixed(decimals)}`
        },
      }),
  })
})

/* ---------- ticker de comentarios: reacciona a la velocidad del scroll ---------- */
if (!reduceMotion) {
  const tweens = $$('.ticker .row').map((row) => {
    const track = $('.track', row)
    const dir = Number(row.dataset.dir ?? -1)
    return dir < 0
      ? gsap.to(track, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 })
      : gsap.fromTo(track, { xPercent: -50 }, { xPercent: 0, duration: 46, ease: 'none', repeat: -1 })
  })
  ScrollTrigger.create({
    onUpdate: (self) => {
      const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 260, 9)
      tweens.forEach((t) => {
        gsap.to(t, { timeScale: boost, duration: 0.2, overwrite: true })
        gsap.to(t, { timeScale: 1, duration: 1.4, delay: 0.2 })
      })
    },
  })
}
