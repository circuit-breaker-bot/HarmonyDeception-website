// Scroll-triggered fade-in animations
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
);

document.querySelectorAll('[data-fade]').forEach((el) => {
  observer.observe(el);
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      // Close mobile nav if open
      const navLinks = document.getElementById('nav-links');
      const navToggle = document.getElementById('nav-toggle');
      if (navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
      }
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Nav background on scroll
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });
}

// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !isExpanded);
    navLinks.classList.toggle('active');
  });

  // Close nav when clicking outside
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && navLinks.classList.contains('active')) {
      navLinks.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// Parallax effect for hero orbs (subtle, performance-conscious)
const hero = document.querySelector('.hero');
const orbs = document.querySelectorAll('.orb');

if (hero && orbs.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const heroHeight = hero.offsetHeight;
        if (scrollY < heroHeight) {
          const factor = scrollY / heroHeight;
          orbs.forEach((orb, i) => {
            const speed = 0.1 + (i * 0.05);
            orb.style.transform = `translateY(${scrollY * speed}px)`;
          });
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}
