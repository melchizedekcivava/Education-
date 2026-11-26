'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const toastContainer = document.getElementById('toast-container');
  const header = document.getElementById('header');
  const navMenu = document.getElementById('nav-menu');
  const hamburger = document.getElementById('hamburger-btn');
  const modal = document.getElementById('auth-modal');
  const modalDialog = modal?.querySelector('.modal-dialog');
  const modalClose = document.getElementById('modal-close-btn');
  const backToTop = document.getElementById('back-to-top');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const themeToggles = document.querySelectorAll('[data-theme-toggle]');
  let lastFocusedElement = null;

  function updateThemeControls(theme) {
    const isDark = theme === 'dark';
    themeToggles.forEach((button) => {
      const label = isDark ? 'Light mode' : 'Dark mode';
      button.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
      const icon = button.querySelector('i');
      const text = button.querySelector('span');
      if (icon) icon.className = `fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}`;
      if (text) text.textContent = label;
    });
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    updateThemeControls(theme);
    try {
      localStorage.setItem('valarie-bree-theme', theme);
    } catch {
      showToast('Theme changed for this visit, but could not be saved in this browser.');
    }
  }

  updateThemeControls(document.documentElement.dataset.theme || 'light');
  themeToggles.forEach((button) => {
    button.addEventListener('click', () => {
      const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      setTheme(nextTheme);
    });
  });

  function showToast(message, type = 'info') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    const icon = document.createElement('i');
    const text = document.createElement('span');
    const iconClass = type === 'success' ? 'fa-circle-check' : 'fa-circle-info';

    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'status');
    icon.className = `fa-solid ${iconClass} toast-icon`;
    icon.setAttribute('aria-hidden', 'true');
    text.textContent = message;
    toast.append(icon, text);
    toastContainer.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));
    window.setTimeout(() => {
      toast.classList.remove('show');
      window.setTimeout(() => toast.remove(), 350);
    }, 4200);
  }

  function setMenuOpen(isOpen) {
    if (!navMenu || !hamburger) return;
    navMenu.classList.toggle('open', isOpen);
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  }

  hamburger?.addEventListener('click', () => {
    setMenuOpen(!navMenu.classList.contains('open'));
  });

  navMenu?.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      document.querySelectorAll('.nav-link').forEach((item) => item.classList.remove('active'));
      link.classList.add('active');
    });
  });

  function setActiveTab(tabButton) {
    const viewId = tabButton.dataset.tab;
    if (!viewId) return;

    document.querySelectorAll('.tab-btn[data-tab]').forEach((button) => {
      const isActive = button === tabButton;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', String(isActive));
      button.tabIndex = isActive ? 0 : -1;
    });

    document.querySelectorAll('.modal-view').forEach((view) => {
      const isActive = view.id === viewId;
      view.classList.toggle('active', isActive);
      view.setAttribute('aria-hidden', String(!isActive));
    });

    const activeHeading = document.querySelector(`#${viewId} .modal-title`);
    if (activeHeading && modalDialog) {
      activeHeading.id = 'active-modal-title';
      modalDialog.setAttribute('aria-labelledby', activeHeading.id);
    }
  }

  function openModal(view = 'login-view') {
    if (!modal) return;
    lastFocusedElement = document.activeElement;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    const tab = document.querySelector(`[data-tab="${view}"]`);
    if (tab) setActiveTab(tab);
    document.getElementById(view)?.querySelector('input')?.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    lastFocusedElement?.focus();
  }

  document.querySelectorAll('[data-modal]').forEach((button) => {
    button.addEventListener('click', () => {
      setMenuOpen(false);
      openModal(button.dataset.modal === 'signup' ? 'signup-view' : 'login-view');
    });
  });

  document.querySelectorAll('.tab-btn[data-tab]').forEach((button) => {
    button.addEventListener('click', () => setActiveTab(button));
  });

  modalClose?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (modal?.classList.contains('active')) closeModal();
      setMenuOpen(false);
    }

    if (event.key !== 'Tab' || !modal?.classList.contains('active')) return;
    const focusable = Array.from(modal.querySelectorAll(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
    )).filter((element) => element.getClientRects().length > 0);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.querySelectorAll('.filter-btn[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      document.querySelectorAll('.filter-btn[data-filter]').forEach((filterButton) => {
        const isActive = filterButton === button;
        filterButton.classList.toggle('active', isActive);
        filterButton.setAttribute('aria-pressed', String(isActive));
      });

      document.querySelectorAll('.course-card[data-category]').forEach((card) => {
        card.hidden = filter !== 'all' && card.dataset.category !== filter;
      });
    });
  });

  document.querySelectorAll('.enroll-btn[data-course]').forEach((button) => {
    button.addEventListener('click', () => {
      openModal('signup-view');
      showToast(`Create an account to continue with ${button.dataset.course}.`);
    });
  });

  function handleDemoForm(form, message) {
    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      showToast(message);
    });
  }

  handleDemoForm(
    document.getElementById('login-form'),
    'Demo only: connect an authentication service to enable sign-in.'
  );
  handleDemoForm(
    document.getElementById('signup-form'),
    'Demo only: connect an authentication service to enable account creation.'
  );
  handleDemoForm(
    document.getElementById('contact-form'),
    'Demo only: this message form is not connected to a messaging service.'
  );
  handleDemoForm(
    document.getElementById('newsletter-form'),
    'Demo only: newsletter sign-up is not connected to an email service.'
  );

  document.querySelectorAll('.forgot-link').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showToast('Demo only: password reset is not connected yet.');
    });
  });

  document.querySelectorAll('a[href="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showToast('This link is not connected yet.');
    });
  });

  function updateScrollControls() {
    const isScrolled = window.scrollY > 24;
    header?.classList.toggle('scrolled', isScrolled);
    backToTop?.classList.toggle('visible', window.scrollY > 400);
  }

  window.addEventListener('scroll', updateScrollControls, { passive: true });
  updateScrollControls();

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  function animateCounter(counter) {
    const target = Number(counter.dataset.target);
    const suffix = counter.dataset.suffix || '';
    if (!Number.isFinite(target)) return;
    if (prefersReducedMotion) {
      counter.textContent = `${target.toLocaleString()}${suffix}`;
      return;
    }

    const start = performance.now();
    const duration = 1400;
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      counter.textContent = `${Math.round(target * eased).toLocaleString()}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const counters = document.querySelectorAll('.stat-number[data-target]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.35 });
    counters.forEach((counter) => observer.observe(counter));
  } else {
    counters.forEach(animateCounter);
  }

  document.querySelectorAll('img:not(.hero-img)').forEach((image) => {
    image.loading = 'lazy';
    image.decoding = 'async';
  });
});