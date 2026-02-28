/* ============================================================
   MARSAPLAY – scripts.js
   ============================================================ */

'use strict';

// ---- CUSTOM CURSOR ----
const cursor      = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursorTrail');

let mouseX = 0, mouseY = 0;
let trailX = 0, trailY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});

// Smooth trail
function animateCursor() {
  trailX += (mouseX - trailX) * 0.12;
  trailY += (mouseY - trailY) * 0.12;
  cursorTrail.style.left = trailX + 'px';
  cursorTrail.style.top  = trailY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Cursor grow on interactive elements
document.querySelectorAll('a, button, input, textarea, select, [data-tilt]')
  .forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width  = '24px';
      cursor.style.height = '24px';
      cursor.style.background = 'var(--cyan)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width  = '12px';
      cursor.style.height = '12px';
      cursor.style.background = 'var(--yellow)';
    });
  });

// ---- NAVBAR SCROLL ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

// ---- HAMBURGER MENU ----
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('mobile-open');
  hamburger.classList.toggle('active', isOpen);
});
// Style for mobile nav open
const styleEl = document.createElement('style');
styleEl.textContent = `
  .nav-links.mobile-open {
    display: flex !important;
    flex-direction: column;
    position: fixed;
    top: 70px; left: 0; right: 0;
    background: rgba(8,12,20,0.98);
    padding: 40px;
    gap: 24px !important;
    border-bottom: 1px solid rgba(240,195,0,0.15);
    z-index: 999;
    animation: slideDown 0.3s ease;
  }
  .nav-links.mobile-open a {
    font-size: 18px !important;
  }
  .hamburger.active span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
  .hamburger.active span:nth-child(2) { opacity: 0; }
  .hamburger.active span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }
  @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
`;
document.head.appendChild(styleEl);

// Close mobile menu on link click
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('mobile-open');
    hamburger.classList.remove('active');
  });
});

// ---- SCROLL TO SECTION ----
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    const offset = 80;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}
window.scrollToSection = scrollToSection;

// ---- ANIMATED COUNTERS ----
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'));
  const duration = 1800;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out quart
    const eased = 1 - Math.pow(1 - progress, 4);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  requestAnimationFrame(update);
}

// ---- INTERSECTION OBSERVER ----
const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
};

// Reveal animations
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => {
        entry.target.classList.add('revealed');
      }, parseInt(delay));
      revealObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

// Counter observer
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

// Add reveal attribute to elements and observe
function initReveal() {
  const sections = document.querySelectorAll('.section-header, .product-card, .tech-item, .pillar, .testimonial-card, .about-text-col, .about-img-col, .contact-info, .contact-form');
  sections.forEach((el, i) => {
    el.setAttribute('data-reveal', '');
    el.setAttribute('data-delay', (i % 4) * 80);
    revealObserver.observe(el);
  });

  document.querySelectorAll('.stat-num').forEach(el => {
    counterObserver.observe(el);
  });
}

// ---- TILT EFFECT on product cards ----
function initTilt() {
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect  = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width  / 2;
      const cy = rect.height / 2;
      const rotX = ((y - cy) / cy) * 5;
      const rotY = ((x - cx) / cx) * -5;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease';
      setTimeout(() => card.style.transition = '', 500);
    });
  });
}

// ---- GALLERY CAROUSEL ----
function initGallery() {
  const track   = document.getElementById('galleryTrack');
  const prevBtn = document.getElementById('galleryPrev');
  const nextBtn = document.getElementById('galleryNext');
  if (!track) return;

  const items     = track.querySelectorAll('.gallery-item');
  let currentIdx  = 0;
  const visibleCount = window.innerWidth < 600 ? 1 : 3;
  const itemsCount = items.length;

  function getOffset() {
    const item      = items[0];
    const gap       = 4;
    const itemWidth = item.offsetWidth + gap;
    return currentIdx * itemWidth;
  }

  function slide(dir) {
    const maxIdx = itemsCount - visibleCount;
    currentIdx = Math.max(0, Math.min(currentIdx + dir, maxIdx));
    track.style.transform = `translateX(-${getOffset()}px)`;
    track.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
  }

  prevBtn.addEventListener('click', () => slide(-1));
  nextBtn.addEventListener('click', () => slide(1));

  // Auto-advance
  let autoInterval = setInterval(() => slide(1), 3500);
  track.addEventListener('mouseenter', () => clearInterval(autoInterval));
  track.addEventListener('mouseleave', () => {
    autoInterval = setInterval(() => {
      if (currentIdx >= itemsCount - visibleCount) {
        currentIdx = -1;
      }
      slide(1);
    }, 3500);
  });
}

// ---- CONTACT FORM ----
function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = 'ENVIANDO...';
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = 'ENVIADO ✓';
    document.getElementById('formSuccess').style.display = 'block';
    e.target.reset();
    setTimeout(() => {
      btn.textContent = 'ENVIAR MENSAJE →';
      btn.disabled = false;
      document.getElementById('formSuccess').style.display = 'none';
    }, 4000);
  }, 1200);
}
window.handleSubmit = handleSubmit;

// ---- BACK TO TOP ----
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

// ---- PIXEL RAIN CANVAS (hero ambient effect) ----
function initPixelRain() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const canvas  = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;z-index:1;opacity:0.04;pointer-events:none;';
  hero.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let W, H, drops;

  function resize() {
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
    const cols = Math.floor(W / 16);
    drops = Array.from({ length: cols }, () => Math.floor(Math.random() * H / 16));
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const chars = '01MARSAPLAY★◆';

  function draw() {
    ctx.fillStyle = 'rgba(8,12,20,0.05)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#f0c300';
    ctx.font      = '12px "Press Start 2P", monospace';

    drops.forEach((y, i) => {
      const ch = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(ch, i * 16, y * 16);
      if (y * 16 > H && Math.random() > 0.975) drops[i] = 0;
      else drops[i]++;
    });

    requestAnimationFrame(draw);
  }
  draw();
}

// ---- GLITCH EFFECT on logo ----
function initGlitch() {
  const logo = document.querySelector('.logo');
  if (!logo) return;

  setInterval(() => {
    if (Math.random() > 0.85) {
      logo.style.textShadow = `${Math.random() * 4 - 2}px 0 var(--cyan), ${Math.random() * 4 - 2}px 0 var(--pink)`;
      setTimeout(() => logo.style.textShadow = '', 80);
    }
  }, 2000);
}

// ---- ACTIVE NAV on scroll ----
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 100;
      if (window.scrollY >= top) current = section.getAttribute('id');
    });
    links.forEach(link => {
      link.style.color = '';
      if (link.getAttribute('href') === `#${current}`) {
        link.style.color = 'var(--yellow)';
      }
    });
  }, { passive: true });
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initTilt();
  initGallery();
  initPixelRain();
  initGlitch();
  initActiveNav();

  // Stagger product card reveals
  document.querySelectorAll('.product-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.1}s`;
  });
});
