import './style.css'
import { profile, sections } from './links.js'

    // ─── GRAVITY TILT — solo en el cards-column ──────────────────────
    ; (function initGravityTilt() {
        const target = document.getElementById('cards-column')
        const MAX_DEG = 2       // ángulo máximo pequeño (solo cards)
        const LERP = 0.09

        let targetX = 0, targetY = 0
        let currentX = 0, currentY = 0
        let isTouch = false

        window.addEventListener('touchstart', () => { isTouch = true }, { once: true })

        window.addEventListener('mousemove', (e) => {
            if (isTouch || !target) return
            const nx = (e.clientX / window.innerWidth - 0.5) * 2
            const ny = (e.clientY / window.innerHeight - 0.5) * 2
            targetX = -ny * MAX_DEG
            targetY = nx * MAX_DEG
        })

        window.addEventListener('mouseleave', () => { targetX = 0; targetY = 0 })

        function tick() {
            currentX += (targetX - currentX) * LERP
            currentY += (targetY - currentY) * LERP
            if (target) {
                target.style.transform =
                    `perspective(900px) rotateX(${currentX.toFixed(3)}deg) rotateY(${currentY.toFixed(3)}deg)`
            }
            requestAnimationFrame(tick)
        }
        tick()
    })()

    // ─── CURSOR GLOW ────────────────────────────────────────────────
    ; (function initCursorGlow() {
        const glow = document.getElementById('cursor-glow')
        if (!glow) return
        let lx = window.innerWidth / 2, ly = window.innerHeight / 2
        let cx = lx, cy = ly

        window.addEventListener('mousemove', (e) => { lx = e.clientX; ly = e.clientY })

        function tick() {
            cx += (lx - cx) * 0.1
            cy += (ly - cy) * 0.1
            glow.style.left = `${cx}px`
            glow.style.top = `${cy}px`
            requestAnimationFrame(tick)
        }
        tick()
    })()

    // ─── EYE TRACKING — unicejo sigue al mouse (desktop) / giroscopio (mobile) ──
    ; (function initEyeTracking() {
        const iris = document.getElementById('eye-iris')
        const socket = document.getElementById('eye-socket')
        if (!iris || !socket) return

        const MAX_OFFSET = 14
        let tx = 0, ty = 0
        let cx = 0, cy = 0

        // Desktop: mouse
        window.addEventListener('mousemove', (e) => {
            const rect = socket.getBoundingClientRect()
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2
            const dx = (e.clientX - centerX) / (window.innerWidth / 2)
            const dy = (e.clientY - centerY) / (window.innerHeight / 2)
            const len = Math.sqrt(dx * dx + dy * dy) || 1
            const scale = Math.min(len, 1)
            tx = (dx / len) * scale * MAX_OFFSET
            ty = (dy / len) * scale * MAX_OFFSET
        })

        // Mobile: orientación del dispositivo (giroscopio)
        window.addEventListener('deviceorientation', (e) => {
            if (e.gamma === null) return
            const gx = Math.max(-30, Math.min(30, e.gamma)) / 30 // -1..1
            const gy = Math.max(-30, Math.min(30, e.beta - 30)) / 30
            tx = gx * MAX_OFFSET
            ty = gy * MAX_OFFSET
        })

        // Mobile fallback: touch position
        window.addEventListener('touchmove', (e) => {
            const t = e.touches[0]
            const rect = socket.getBoundingClientRect()
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2
            const dx = (t.clientX - centerX) / (window.innerWidth / 2)
            const dy = (t.clientY - centerY) / (window.innerHeight / 2)
            const len = Math.sqrt(dx * dx + dy * dy) || 1
            const scale = Math.min(len, 1)
            tx = (dx / len) * scale * MAX_OFFSET
            ty = (dy / len) * scale * MAX_OFFSET
        }, { passive: true })

        function tick() {
            cx += (tx - cx) * 0.12
            cy += (ty - cy) * 0.12
            iris.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`
            requestAnimationFrame(tick)
        }
        tick()
    })()

// ─── BUILD CARD ─────────────────────────────────────────────────
function buildCard(link) {
    const a = document.createElement('a')
    a.href = link.href || '#'
    a.className = `link-card${link.featured ? ' featured' : ''}`
    a.id = `link-${link.id}`

    if (link.href?.startsWith('http') || link.href?.startsWith('mailto')) {
        a.setAttribute('target', '_blank')
        a.setAttribute('rel', 'noopener noreferrer')
    }

    const color = link.color || '#9b3dff'
    a.innerHTML = `
    <div class="card-accent" style="background:${color};"></div>
    <div class="card-info">
      <div class="card-name">${link.name}</div>
      <div class="card-handle">${link.handle}</div>
    </div>
    <span class="card-arrow">›</span>
  `

    a.addEventListener('mouseenter', () => {
        a.style.boxShadow = `0 4px 24px ${color}22`
        a.querySelector('.card-accent').style.boxShadow = `0 0 10px ${color}88`
    })
    a.addEventListener('mouseleave', () => {
        a.style.boxShadow = ''
        a.querySelector('.card-accent').style.boxShadow = ''
    })

    return a
}

// ─── STAGGERED ENTRANCE ─────────────────────────────────────────
function observeCards() {
    const cards = document.querySelectorAll('.link-card')
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible')
                io.unobserve(entry.target)
            }
        })
    }, { threshold: 0.06 })

    cards.forEach((card, i) => {
        card.style.animationDelay = `${i * 45}ms`
        io.observe(card)
    })
}

// ─── RENDER ─────────────────────────────────────────────────────
function render() {
    const logoEl = document.getElementById('logo-img')
    if (logoEl) logoEl.src = profile.logo
    document.getElementById('brand-name').textContent = profile.name
    document.getElementById('tagline').textContent = profile.tagline

    const footerLogo = document.querySelector('.footer-logo')
    const footerCopy = document.querySelector('.footer-copy')
    if (footerLogo) footerLogo.src = profile.logo
    if (footerCopy) footerCopy.textContent =
        `© ${profile.year} ${profile.name} · Todos los derechos reservados`

    const container = document.getElementById('links-container')
    sections.forEach(section => {
        const label = document.createElement('span')
        label.className = 'section-label'
        label.textContent = section.label
        container.appendChild(label)

        const group = document.createElement('div')
        group.className = 'links-group'
        section.links.forEach(link => group.appendChild(buildCard(link)))
        container.appendChild(group)
    })

    observeCards()
}

// ─── PARTICLES ──────────────────────────────────────────────────
function spawnParticles() {
    const el = document.getElementById('particles')
    if (!el) return
    const colors = ['rgba(160,60,255,', 'rgba(220,80,255,', 'rgba(100,20,200,', 'rgba(200,64,251,']
    for (let i = 0; i < 24; i++) {
        const p = document.createElement('div')
        p.className = 'particle'
        const size = Math.random() * 4 + 1.5
        const color = colors[Math.floor(Math.random() * colors.length)]
        p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;background:radial-gradient(circle,${color}0.7),transparent);animation-duration:${Math.random() * 16 + 12}s;animation-delay:${Math.random() * 15}s;`
        el.appendChild(p)
    }
}

// ─── INIT ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    render()
    spawnParticles()
})
