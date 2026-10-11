import { ScrollTrigger } from './gsap'
import './ui'
import './hero-stage'
import './how-scroll'

document.fonts.ready.then(() => ScrollTrigger.refresh())
window.addEventListener('load', () => ScrollTrigger.refresh())
