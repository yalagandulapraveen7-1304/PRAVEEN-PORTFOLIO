/**
 * app.js - Praveen Yalagandula Portfolio
 * Full-Stack Developer & AI-Augmented Engineer
 * Clean Vanilla ES6+ interactions: drag-to-scroll physics, spotlight hover, nav, reveal, 3D tilt
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
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
     2. NAV - Scroll-aware background + Mobile menu toggle
  ==================================================================== */
  const nav = qs('#main-nav');
  const menuBtn = qs('#mobile-menu-btn');
  const mobileMenu = qs('#mobile-menu');
  const mobileLinks = qsa('.mobile-nav-link');
  let menuOpen = false;

  window.addEventListener('scroll', () => {
    if (!nav) return;
    if (window.scrollY > 40) {
      nav.style.background = 'rgba(7, 7, 18, 0.95)';
      nav.classList.add('border-white/10');
    } else {
      nav.style.background = 'rgba(7, 7, 18, 0.75)';
      nav.classList.remove('border-white/10');
    }
  }, { passive: true });

  if (menuBtn && mobileMenu) {
    const spans = qsa('span', menuBtn);

    function openMenu() {
      menuOpen = true;
      mobileMenu.style.maxHeight = mobileMenu.scrollHeight + 'px';
      menuBtn.setAttribute('aria-expanded', 'true');
      if (spans.length >= 3) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        spans[2].style.width = '1.25rem';
      }
    }

    function closeMenu() {
      menuOpen = false;
      mobileMenu.style.maxHeight = '0';
      menuBtn.setAttribute('aria-expanded', 'false');
      if (spans.length >= 3) {
        spans[0].style.transform = '';
        spans[1].style.opacity = '1';
        spans[2].style.transform = '';
        spans[2].style.width = '';
      }
    }

    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      menuOpen ? closeMenu() : openMenu();
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', (e) => {
      if (menuOpen && !nav.contains(e.target)) closeMenu();
    });
  }

  /* ====================================================================
     3. SCROLL REVEAL - Intersection Observer
  ==================================================================== */
  const revealEls = qsa('.reveal');
  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));
  }

  /* ====================================================================
     4. DRAG-TO-SCROLL WITH MOMENTUM (Desktop)
  ==================================================================== */
  const scrollers = qsa('.drag-scroll');
  scrollers.forEach(el => {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let velocity = 0;
    let lastX = 0;
    let rafId = null;

    function applyMomentum() {
      velocity *= 0.92;
      if (Math.abs(velocity) < 0.5) {
        velocity = 0;
        return;
      }
      el.scrollLeft -= velocity;
      rafId = requestAnimationFrame(applyMomentum);
    }

    el.addEventListener('mousedown', (e) => {
      if (e.target.closest('a, button, input')) return;
      isDown = true;
      el.classList.add('is-dragging');
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
      velocity = 0;
      lastX = e.pageX;
      if (rafId) cancelAnimationFrame(rafId);
    });

    el.addEventListener('mouseleave', () => {
      if (!isDown) return;
      isDown = false;
      el.classList.remove('is-dragging');
      rafId = requestAnimationFrame(applyMomentum);
    });

    el.addEventListener('mouseup', () => {
      if (!isDown) return;
      isDown = false;
      el.classList.remove('is-dragging');
      rafId = requestAnimationFrame(applyMomentum);
    });

    el.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      velocity = e.pageX - lastX;
      lastX = e.pageX;
      el.scrollLeft = scrollLeft - walk;
    });
  });

  /* ====================================================================
     5. SPOTLIGHT HOVER FOR GALLERY
  ==================================================================== */
  const galleryTrack = qs('#gallery-track');
  if (galleryTrack) {
    galleryTrack.addEventListener('mouseenter', () => galleryTrack.classList.add('has-hover'));
    galleryTrack.addEventListener('mouseleave', () => galleryTrack.classList.remove('has-hover'));
  }

  /* ====================================================================
     6. SMOOTH SCROLL FOR ANCHOR LINKS
  ==================================================================== */
  qsa('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = qs(href);
      if (!target) return;
      e.preventDefault();
      const navH = nav?.offsetHeight || 64;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ====================================================================
     7. ACTIVE NAV LINK HIGHLIGHT
  ==================================================================== */
  const sections = qsa('section[id]');
  const navLinks = qsa('nav a[href^="#"]');
  if (sections.length && navLinks.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const currentId = entry.target.id;
          navLinks.forEach(link => {
            const href = link.getAttribute('href')?.slice(1);
            if (href === currentId) {
              link.classList.add('text-white');
              link.classList.remove('text-white/50');
            } else {
              link.classList.remove('text-white');
              link.classList.add('text-white/50');
            }
          });
        }
      });
    }, { rootMargin: '-80px 0px -50% 0px', threshold: 0 });

    sections.forEach(s => navObserver.observe(s));
  }

  /* ====================================================================
     8. 3D TILT EFFECT FOR CARDS ON HOVER
  ==================================================================== */
  const tiltCards = qsa('.service-card, .tilt-card');
  const MAX_TILT = 4; // degrees

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const tiltX = dy * -MAX_TILT;
      const tiltY = dx * MAX_TILT;
      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-3px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ====================================================================
     9. AMBIENT ORB PARALLAX ON SCROLL
  ==================================================================== */
  const orbs = qsa('#hero .float-anim');
  if (orbs.length) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          orbs.forEach((orb, i) => {
            const speed = 0.06 + i * 0.03;
            orb.style.transform = `translateY(${y * speed}px)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  console.log('%c Praveen Yalagandula Portfolio Loaded ', 'background:#4c6ef5;color:#fff;padding:4px 10px;border-radius:4px;font-weight:700;');
});
