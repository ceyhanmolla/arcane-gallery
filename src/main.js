import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import createSpiral from './spiral.js'

gsap.registerPlugin(ScrollTrigger)

const spiral = createSpiral(document.getElementById('webgl'))

const lenis = new Lenis({
  duration: 1.8,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 0.8,
})

lenis.on('scroll', (e) => {
  ScrollTrigger.update()
  spiral.setScrollVelocity(e.velocity)
})

function gsapTick(time) {
  lenis.raf(time * 1000)
}
gsap.ticker.add(gsapTick)
gsap.ticker.lagSmoothing(0)

ScrollTrigger.scrollerProxy(window, {
  scrollTop(value) {
    if (arguments.length) {
      lenis.scrollTo(value, { immediate: true })
    }
    return lenis.scroll
  }
})

const hero = document.getElementById('hero')

ScrollTrigger.create({
  trigger: hero,
  start: 'top top',
  end: `+=${window.innerHeight}`,
  pin: true,
  pinSpacing: true,
})

const sub = document.querySelector('.hero-sub')
ScrollTrigger.create({
  trigger: document.getElementById('content'),
  start: 'top bottom-=' + window.innerHeight * 0.3,
  end: 'top top+=' + window.innerHeight * 0.2,
  onUpdate: (self) => {
    sub.style.opacity = 1 - self.progress * 2
  },
})

const navbar = document.getElementById('navbar')
ScrollTrigger.create({
  trigger: document.getElementById('content'),
  start: 'top bottom',
  onEnter: () => navbar.classList.add('scrolled'),
  onLeaveBack: () => navbar.classList.remove('scrolled'),
})

document.querySelectorAll('.nav-links a, .nav-logo').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault()
    const target = document.querySelector(link.getAttribute('href'))
    if (target) {
      lenis.scrollTo(target, { duration: 1.6 })
    }
  })
})

document.querySelectorAll('.gsap-reveal').forEach((el) => {
  gsap.fromTo(el,
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        end: 'top 50%',
        toggleActions: 'play none none reverse',
      },
    }
  )
})

window.addEventListener('resize', () => {
  spiral.resize()
  ScrollTrigger.refresh()
})

lenis.start()
