import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }
export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
