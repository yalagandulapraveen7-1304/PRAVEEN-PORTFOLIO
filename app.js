/**
 * app.js — Praveen Yalagandula Portfolio
 * Vanilla JS (ES6+): drag-to-scroll, spotlight hover, nav, scroll-reveal, and polish
 */

'use strict';

/* ====================================================================
   UTILITY: DOM Query Helpers
==================================================================== */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ====================================================================
   1. DYNAMIC YEAR IN FOOTER
==================================================================== */
const yearEl = qs('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ====================================================================
   2. NAV — Scroll-aware shrink + mobile menu toggle
==================================================================== */
(function initNav() {
  const nav      = qs('#main-nav');
  const menuBtn  = qs('#mobile-menu-btn');
  const mobileMenu = qs('#mobile-menu');
  const mobileLinks = qsa('.mobile-nav-link');
  let menuOpen = false;

  // Scroll: add border when scrolled
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.classList.add('border-white/10');
    } else {
      nav.classList.remove('border-white/10');
    }
  }, { passive: true });

  // Mobile menu toggle
  if (menuBtn && mobileMenu) {
    const spans = qsa('span', menuBtn);

    function openMenu() {
      menuOpen = true;
      mobileMenu.style.maxHeight = mobileMenu.scrollHeight + 'px';
      menuBtn.setAttribute('aria-expanded', 'true');
      // Animate hamburger → X
      spans[0].style.transform = 'translateY(8px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-8px) rotate(-45deg)';
      spans[2].style.width     = '20px';
    }

    function closeMenu() {
      menuOpen = false;
      mobileMenu.style.maxHeight = '0';
      menuBtn.setAttribute('aria-expanded', 'false');
      // Restore hamburger
      spans[0].style.transform = '';
      spans[1].style.opacity   = '1';
      spans[2].style.transform = '';
      spans[2].style.width     = '';
    }

    menuBtn.addEventListener('click', () => menuOpen ? closeMenu() : openMenu());

    // Close on link click
    mobileLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (menuOpen && !nav.contains(e.target)) closeMenu();
    });
  }
})();

/* ====================================================================
   3. SCROLL REVEAL — Intersection Observer
==================================================================== */
(function initReveal() {
  const els = qsa('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // fire once
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
})();

/* ====================================================================
   4. DRAG-TO-SCROLL — Desktop mouse drag for horizontal carousels
==================================================================== */
(function initDragScroll() {
  const scrollers = qsa('.drag-scroll');

  scrollers.forEach(el => {
    let isDown  = false;
    let startX  = 0;
    let scrollLeft = 0;
    let velocity   = 0;
    let lastX      = 0;
    let rafId      = null;
    let lastTime   = 0;

    // --- Momentum helpers ---
    function applyMomentum() {
      velocity *= 0.92; // friction
      if (Math.abs(velocity) < 0.5) {
        velocity = 0;
        return;
      }
      el.scrollLeft -= velocity;
      rafId = requestAnimationFrame(applyMomentum);
    }

    el.addEventListener('mousedown', (e) => {
      // Ignore if clicking an anchor/button
      if (e.target.closest('a, button')) return;

      isDown = true;
      el.classList.add('is-dragging');
      startX     = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
      velocity   = 0;
      lastX      = e.pageX;
      lastTime   = Date.now();
      if (rafId) cancelAnimationFrame(rafId);
    });

    el.addEventListener('mouseleave', () => {
      if (!isDown) return;
      isDown = false;
      el.classList.remove('is-dragging');
      rafId = requestAnimationFrame(applyMomentum);
    });

    el.addEventListener('mouseup', (e) => {
      if (!isDown) return;
      isDown = false;
      el.classList.remove('is-dragging');
      // Calculate final velocity
      const dt = Date.now() - lastTime;
      if (dt < 80) {
        velocity = (lastX - e.pageX) / (dt || 1) * 8;
      }
      rafId = requestAnimationFrame(applyMomentum);
    });

    el.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x    = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.4; // drag multiplier
      // Track velocity
      velocity = lastX - e.pageX;
      lastX    = e.pageX;
      lastTime = Date.now();
      el.scrollLeft = scrollLeft - walk;
    });

    // Prevent click-through after a drag
    el.addEventListener('click', (e) => {
      if (Math.abs(el.scrollLeft - scrollLeft) > 5) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  });
})();

/* ====================================================================
   5. SPOTLIGHT HOVER — Gallery "has-hover" dim effect
   When any project card is hovered, siblings dim via the .has-hover class
==================================================================== */
(function initSpotlight() {
  const track = qs('#gallery-track');
  if (!track) return;

  const cards = qsa('.project-card', track);

  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      track.classList.add('has-hover');
    });
    card.addEventListener('mouseleave', () => {
      track.classList.remove('has-hover');
    });
  });

  // Also remove on track mouse-leave
  track.addEventListener('mouseleave', () => {
    track.classList.remove('has-hover');
  });
})();

/* ====================================================================
   6. MOUSE-TRACKED CARD GLOW — Subtle parallax light follow on glass cards
==================================================================== */
(function initCardGlow() {
  const cards = qsa('.glass-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x    = ((e.clientX - rect.left) / rect.width)  * 100;
      const y    = ((e.clientY - rect.top)  / rect.height) * 100;

      card.style.setProperty('--glow-x', `${x}%`);
      card.style.setProperty('--glow-y', `${y}%`);
      card.style.background =
        `radial-gradient(circle at ${x}% ${y}%, rgba(92,124,250,0.1) 0%, rgba(255,255,255,0.04) 50%), rgba(255,255,255,0.04)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });
})();

/* ====================================================================
   7. SMOOTH SCROLL — Enhanced native smooth scroll for anchor links
==================================================================== */
(function initSmoothScroll() {
  qsa('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = qs(href);
      if (!target) return;
      e.preventDefault();
      const navH   = qs('#main-nav')?.offsetHeight || 64;
      const top    = target.getBoundingClientRect().top + window.scrollY - navH - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ====================================================================
   8. ACTIVE NAV LINK HIGHLIGHT — Intersection Observer on sections
==================================================================== */
(function initActiveNav() {
  const sections  = qsa('section[id]');
  const navLinks  = qsa('nav a[href^="#"]');
  const navHeight = 64;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          const href = link.getAttribute('href').slice(1);
          if (href === entry.target.id) {
            link.style.color = 'rgba(255,255,255,0.95)';
          } else {
            link.style.color = '';
          }
        });
      }
    });
  }, {
    rootMargin: `-${navHeight + 20}px 0px -55% 0px`,
    threshold: 0,
  });

  sections.forEach(s => observer.observe(s));
})();

/* ====================================================================
   9. TYPED HEADLINE EFFECT — Subtle character-by-character reveal on hero h1
==================================================================== */
(function initTypedEffect() {
  // Wait for DOM to be stable, then add class
  requestAnimationFrame(() => {
    const h1 = qs('#hero h1');
    if (!h1) return;
    h1.style.opacity = '1';
  });
})();

/* ====================================================================
   10. CONTACT CARDS — Staggered entrance animation
==================================================================== */
(function initContactStagger() {
  const cards = qsa('#contact .contact-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = cards.indexOf(entry.target);
        setTimeout(() => {
          entry.target.style.opacity    = '1';
          entry.target.style.transform  = 'translateY(0)';
        }, idx * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  cards.forEach(card => {
    card.style.opacity   = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
  });
})();

/* ====================================================================
   11. SERVICE CARDS — Tilt effect on mouse move
==================================================================== */
(function initTilt() {
  const cards = qsa('.service-card');
  const MAX_TILT = 5; // degrees

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const tiltX  = dy * -MAX_TILT;
      const tiltY  = dx *  MAX_TILT;
      card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-2px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ====================================================================
   12. HERO PARALLAX — Subtle ambient orb parallax on scroll
==================================================================== */
(function initParallax() {
  const orbs = qsa('#hero .float-anim');
  if (!orbs.length) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        orbs.forEach((orb, i) => {
          const speed = 0.08 + i * 0.04;
          orb.style.transform = `translateY(${y * speed}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ====================================================================
   INIT LOG
==================================================================== */
console.log('%c PY Portfolio Loaded ✦ ', 'background:#4c6ef5;color:#fff;padding:4px 10px;border-radius:4px;font-weight:700;');
