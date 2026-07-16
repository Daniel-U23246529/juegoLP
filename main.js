/* =========================================
   PIXELBEAST — LANDING PAGE SCRIPTS
   ========================================= */

/* ── 1. CANVAS DE FONDO (estrellas + partículas) ── */
const canvas = document.getElementById('bgCanvas');
const ctx    = canvas.getContext('2d');

let W, H, stars = [], particles = [];

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

/* Genera estrellas */
function initStars() {
  stars = [];
  const count = Math.floor((W * H) / 5000);
  for (let i = 0; i < count; i++) {
    stars.push({
      x:    Math.random() * W,
      y:    Math.random() * H,
      r:    Math.random() * 1.5 + 0.3,
      a:    Math.random(),
      da:   (Math.random() * 0.005 + 0.002) * (Math.random() < 0.5 ? 1 : -1),
      speed: Math.random() * 0.15 + 0.05
    });
  }
}
initStars();
window.addEventListener('resize', initStars);

/* Partícula de pixel art */
function spawnParticle() {
  const colors = ['#f5c518', '#ff6b6b', '#00d4aa', '#8b5cf6', '#4fc3f7'];
  particles.push({
    x:    Math.random() * W,
    y:    H + 10,
    vx:   (Math.random() - 0.5) * 0.8,
    vy:   -(Math.random() * 1.5 + 0.5),
    size: Math.floor(Math.random() * 3 + 1) * 2, // múltiplos de 2 → pixel feel
    color: colors[Math.floor(Math.random() * colors.length)],
    life: 1,
    decay: Math.random() * 0.003 + 0.001
  });
}

let lastParticleTime = 0;
function loop(ts) {
  requestAnimationFrame(loop);
  ctx.clearRect(0, 0, W, H);

  /* Spawn partículas */
  if (ts - lastParticleTime > 300) {
    spawnParticle();
    lastParticleTime = ts;
  }

  /* Dibuja estrellas */
  for (const s of stars) {
    s.a += s.da;
    if (s.a <= 0 || s.a >= 1) s.da *= -1;
    s.y -= s.speed;
    if (s.y < -2) s.y = H + 2;

    ctx.globalAlpha = Math.max(0, Math.min(1, s.a));
    ctx.fillStyle   = '#e8e8f0';
    ctx.fillRect(Math.round(s.x), Math.round(s.y), s.r * 2, s.r * 2);
  }

  /* Dibuja partículas */
  particles = particles.filter(p => p.life > 0);
  for (const p of particles) {
    p.x    += p.vx;
    p.y    += p.vy;
    p.life -= p.decay;
    ctx.globalAlpha = p.life;
    ctx.fillStyle   = p.color;
    ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
  }

  ctx.globalAlpha = 1;
}
requestAnimationFrame(loop);

/* ── 2. DADO DEMO ── */
const diceEl = document.getElementById('diceDemo');

window.rollDice = function() {
  if (diceEl.classList.contains('rolling')) return;
  diceEl.classList.add('rolling');

  // Muestra números rápidamente durante la animación
  let ticks = 0;
  const tickInterval = setInterval(() => {
    diceEl.textContent = Math.floor(Math.random() * 6) + 1;
    ticks++;
    if (ticks >= 10) clearInterval(tickInterval);
  }, 50);

  setTimeout(() => {
    const result = Math.floor(Math.random() * 6) + 1;
    diceEl.textContent = result;
    diceEl.classList.remove('rolling');

    // Feedback visual según resultado
    diceEl.style.background = result >= 5 ? '#00d4aa' :
                               result >= 3 ? '#f5c518' : '#e03c3c';
    setTimeout(() => {
      diceEl.style.background = '#f5c518';
    }, 800);
  }, 550);
};

/* ── 3. INTERSECTION OBSERVER — animar barras de stats ── */
const observerOptions = { threshold: 0.3 };
const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      cardObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.beast-card').forEach(card => {
  cardObserver.observe(card);
});

/* ── 4. SCROLL REVEAL — fade-in genérico ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(
  '.mechanic-card, .char-card, .section-title-wrap'
).forEach(el => {
  el.classList.add('reveal-target');
  revealObserver.observe(el);
});

/* Agrega los estilos de reveal dinámicamente */
const revealStyle = document.createElement('style');
revealStyle.textContent = `
  .reveal-target {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  .reveal-target.revealed {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(revealStyle);

/* ── 5. SCROLL ACTIVO EN NAV ── */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 100;
  sections.forEach(section => {
    const top    = section.offsetTop;
    const bottom = top + section.offsetHeight;
    const id     = section.id;
    navLinks.forEach(link => {
      if (link.getAttribute('href') === `#${id}`) {
        link.style.color = scrollY >= top && scrollY < bottom
          ? 'var(--primary)'
          : 'var(--text-dim)';
      }
    });
  });
}, { passive: true });

/* ── 6. BOTÓN DESCARGA — efecto de píxeles al click ── */
document.getElementById('downloadBtn')?.addEventListener('click', function(e) {
  // Explosión de partículas desde el botón
  const rect = this.getBoundingClientRect();
  const cx   = rect.left + rect.width  / 2;
  const cy   = rect.top  + rect.height / 2;
  const colors = ['#f5c518','#ffdd55','#ffffff','#00d4aa'];

  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const speed = Math.random() * 4 + 2;
    particles.push({
      x:    cx,
      y:    cy,
      vx:   Math.cos(angle) * speed,
      vy:   Math.sin(angle) * speed - 2,
      size: Math.floor(Math.random() * 3 + 2) * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      life:  1,
      decay: 0.02
    });
  }
});

/* ── 7. CURSOR PIXEL (solo desktop) ── */
if (window.matchMedia('(pointer: fine)').matches) {
  const cursor = document.createElement('div');
  cursor.style.cssText = `
    position: fixed;
    width: 8px;
    height: 8px;
    background: var(--primary, #f5c518);
    pointer-events: none;
    z-index: 9999;
    transition: transform 0.1s;
    image-rendering: pixelated;
  `;
  document.body.appendChild(cursor);

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX - 4 + 'px';
    cursor.style.top  = e.clientY - 4 + 'px';
  });

  document.querySelectorAll('a, button, .beast-card, .char-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.style.transform = 'scale(2)');
    el.addEventListener('mouseleave', () => cursor.style.transform = 'scale(1)');
  });
}

/* ── 8. EASTER EGG — Konami Code ── */
const konamiCode = [38,38,40,40,37,39,37,39,66,65];
let konamiIdx = 0;
document.addEventListener('keydown', (e) => {
  if (e.keyCode === konamiCode[konamiIdx]) {
    konamiIdx++;
    if (konamiIdx === konamiCode.length) {
      konamiIdx = 0;
      showKonami();
    }
  } else {
    konamiIdx = 0;
  }
});

function showKonami() {
  const banner = document.createElement('div');
  banner.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0,0,0,0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;
    cursor: pointer;
  `;
  banner.innerHTML = `
    <p style="font-family:'Press Start 2P',monospace;font-size:clamp(10px,2vw,16px);color:#f5c518;text-align:center;text-shadow:0 0 20px #f5c518">
      ⚡ CÓDIGO KONAMI ⚡
    </p>
    <p style="font-family:'VT323',monospace;font-size:clamp(20px,4vw,32px);color:#e8e8f0;text-align:center">
      ¡Eres un maestro de PixelBeast!<br/>
      Tu equipo legendario aguarda.
    </p>
    <p style="font-family:'Press Start 2P',monospace;font-size:8px;color:#888899">Click para cerrar</p>
  `;
  banner.addEventListener('click', () => banner.remove());
  document.body.appendChild(banner);

  // Lluvia de partículas
  for (let i = 0; i < 60; i++) {
    setTimeout(() => {
      particles.push({
        x:    Math.random() * W,
        y:    Math.random() * H,
        vx:   (Math.random() - 0.5) * 3,
        vy:   -(Math.random() * 3 + 1),
        size: Math.floor(Math.random() * 4 + 2) * 2,
        color: ['#f5c518','#00d4aa','#ff6b6b','#8b5cf6'][Math.floor(Math.random()*4)],
        life:  1,
        decay: 0.008
      });
    }, i * 30);
  }
}
