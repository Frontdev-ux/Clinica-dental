const body = document.body;
const header = document.querySelector('.site-header');
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const shareButton = document.getElementById('share-button');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxClose = document.getElementById('lightbox-close');
const leadForm = document.getElementById('lead-form');
const cursorGlow = document.querySelector('.cursor-glow');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function toggleMenu(forceOpen = null) {
  const shouldOpen = forceOpen ?? !mobileMenu.classList.contains('open');
  mobileMenu.classList.toggle('open', shouldOpen);
  menuToggle.setAttribute('aria-expanded', String(shouldOpen));
}

if (menuToggle) {
  menuToggle.addEventListener('click', () => toggleMenu());
}

document.querySelectorAll('.mobile-menu a').forEach((link) => {
  link.addEventListener('click', () => toggleMenu(false));
});

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

if (shareButton) {
  shareButton.addEventListener('click', async () => {
    const shareData = {
      title: 'Clínica Dental Smiling - Congreso',
      text: 'Clínica Dental Smiling en Congreso, CABA.',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (_) {
        // continue to clipboard fallback
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles.');
    } catch (_) {
      alert('No se pudo compartir automáticamente.');
    }
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.counter || 0);
    const duration = 1200;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased).toLocaleString('es-AR');
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-counter]').forEach((counter) => counterObserver.observe(counter));

document.querySelectorAll('.gallery-card').forEach((button) => {
  button.addEventListener('click', () => {
    lightboxImage.src = button.dataset.lightbox;
    lightboxCaption.textContent = button.dataset.caption || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    body.style.overflow = 'hidden';
  });
});

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  body.style.overflow = '';
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeLightbox();
    toggleMenu(false);
  }
});

document.querySelectorAll('.faq-question').forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    const isOpen = item.classList.contains('open');

    document.querySelectorAll('.faq-item').forEach((faq) => {
      faq.classList.remove('open');
      faq.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
      item.classList.add('open');
      button.setAttribute('aria-expanded', 'true');
    }
  });
});

if (leadForm) {
  leadForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('lead-name').value.trim();
    const phone = document.getElementById('lead-phone').value.trim();
    const message = document.getElementById('lead-message').value.trim();

    if (!name || !phone || !message) {
      alert('Completá los campos antes de enviar.');
      return;
    }

    const text = `Hola, soy ${name}. Mi teléfono es ${phone}. Quisiera consultar: ${message}`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=541167523939&text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank', 'noopener');
    leadForm.reset();
  });
}

if (!reduceMotion && cursorGlow && window.matchMedia('(pointer:fine)').matches) {
  const updateGlow = (event) => {
    cursorGlow.style.opacity = '1';
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  };

  window.addEventListener('pointermove', updateGlow, { passive: true });
  window.addEventListener('pointerleave', () => {
    cursorGlow.style.opacity = '0';
  });

  document.querySelectorAll('.tilt-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * 6;
      const rotateX = (0.5 - py) * 5;
      card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });
}
