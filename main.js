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
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.faction-card, .role-card, .howto-step, .intro-text, .intro-quote').forEach((el) => {
  el.setAttribute('data-fade', '');
  observer.observe(el);
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Nav background on scroll
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 80) {
    nav.style.background = 'rgba(13, 10, 20, 0.92)';
    nav.style.backdropFilter = 'blur(16px)';
    nav.style.transition = 'background 0.3s, backdrop-filter 0.3s';
  } else {
    nav.style.background = '';
    nav.style.backdropFilter = '';
  }
}, { passive: true });
