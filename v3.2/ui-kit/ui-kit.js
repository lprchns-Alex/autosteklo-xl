/* Standalone UI kit interactions. No production form submission or site bootstrap. */
(() => {
  'use strict';

  const toast = document.getElementById('kit-toast');
  let toastTimer;
  function notify(message) {
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 5000);
  }

  const dialog = document.getElementById('kit-dialog');
  const dialogTitle = document.getElementById('kit-dialog-title');
  const dialogDescription = document.getElementById('kit-dialog-description');
  let dialogTrigger = null;
  function openDialog(trigger) {
    if (!dialog) return;
    dialogTrigger = trigger;
    const label = trigger.dataset.dialogTitle || trigger.getAttribute('aria-label') ||
      trigger.textContent.trim().replace(/\s+/g, ' ') || 'Подробнее об услуге';
    if (dialogTitle) dialogTitle.textContent = label;
    if (dialogDescription) dialogDescription.textContent =
      'Это демонстрация диалогового окна. Здесь на сайте появляются подробности об услуге, стоимости или сервисном центре. Заявки из UI kit не отправляются.';
    if (!dialog.open) dialog.showModal();
  }
  if (dialog) {
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right ||
          event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (dialogTrigger?.isConnected) dialogTrigger.focus({ preventScroll: true });
      dialogTrigger = null;
    });
  }

  document.addEventListener('click', async (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const copy = target.closest('[data-copy]');
    if (copy) {
      event.preventDefault();
      const value = copy.dataset.copy || '';
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(value);
        notify(value.startsWith('<svg') ? 'SVG иконки скопирован.' : `Скопировано: ${value}`);
      } catch {
        notify(`Скопируйте значение: ${value}`);
      }
      return;
    }

    if (target.closest('[data-close-dialog]')) {
      event.preventDefault();
      dialog?.close();
      return;
    }
    const showToast = target.closest('[data-show-toast]');
    if (showToast) {
      event.preventDefault();
      notify(showToast.dataset.showToast || 'Пример уведомления: действие выполнено.');
      return;
    }

    const explicitTrigger = target.closest('[data-open-dialog]');
    const siteTrigger = target.closest('[data-service], [data-modal], [data-book], [data-center]');
    const trigger = explicitTrigger || (siteTrigger?.closest('.kit-demo') ? siteTrigger : null);
    if (trigger && !trigger.disabled && trigger.getAttribute('aria-disabled') !== 'true') {
      event.preventDefault();
      openDialog(trigger);
      return;
    }

    // Contact specimens demonstrate their styling without initiating a real call/email.
    const contactLink = target.closest('.kit-demo a[href^="tel:"], .kit-demo a[href^="mailto:"]');
    if (contactLink) {
      event.preventDefault();
      notify(`Пример контакта: ${contactLink.textContent.trim()}`);
    }
  });

  const form = document.getElementById('kit-form');
  if (form) {
    form.noValidate = true;
    let submitted = false;
    const rules = {
      name: (field) => field.value.trim() ? '' : 'Укажите ваше имя.',
      phone: (field) => field.value.replace(/\D/g, '').length >= 10 ? '' : 'Введите телефон: не менее 10 цифр.',
      consent: (field) => field.checked ? '' : 'Подтвердите согласие с условиями.'
    };
    function validate(name) {
      const field = form.elements.namedItem(name);
      if (!(field instanceof HTMLInputElement)) return true;
      const message = rules[name](field);
      const error = form.querySelector(`[data-error-for="${name}"]`);
      field.setAttribute('aria-invalid', String(Boolean(message)));
      if (error) {
        if (!error.id) error.id = `kit-error-${name}`;
        const describedBy = new Set((field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
        describedBy.add(error.id);
        field.setAttribute('aria-describedby', [...describedBy].join(' '));
        error.textContent = message;
        error.hidden = !message;
      }
      return !message;
    }
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      submitted = true;
      const invalid = Object.keys(rules).filter((name) => !validate(name));
      if (invalid.length) {
        form.elements.namedItem(invalid[0])?.focus();
        return;
      }
      notify('Демонстрационная форма проверена. Данные не отправлены.');
    });
    form.addEventListener('input', (event) => {
      if (submitted && Object.hasOwn(rules, event.target.name)) validate(event.target.name);
    });
    form.addEventListener('change', (event) => {
      if (submitted && Object.hasOwn(rules, event.target.name)) validate(event.target.name);
    });
  }

  const navLinks = [...document.querySelectorAll('.kit-nav a[href^="#"]')];
  const sections = [...document.querySelectorAll('section.kit-section[id]')];
  function activate(id) {
    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${id}`;
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  if (sections.length) {
    activate(sections[0].id);
    const updateActiveSection = () => {
      const current = sections.filter((section) => section.getBoundingClientRect().top <= 170).at(-1);
      activate((current || sections[0]).id);
    };
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(updateActiveSection, {
        rootMargin: '-100px 0px -50% 0px', threshold: [0, 0.1, 0.5]
      });
      sections.forEach((section) => observer.observe(section));
    }
    navLinks.forEach((link) => link.addEventListener('click', () => activate(link.hash.slice(1))));
    window.addEventListener('hashchange', updateActiveSection);
  }

  const menuToggle = document.getElementById('kit-menu-toggle');
  const mobileMenu = document.getElementById('kit-mobile-menu');
  if (menuToggle && mobileMenu) {
    function setMenu(open) {
      mobileMenu.hidden = !open;
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Закрыть меню разделов' : 'Открыть меню разделов');
    }
    setMenu(false);
    menuToggle.addEventListener('click', () => setMenu(mobileMenu.hidden));
    mobileMenu.addEventListener('click', (event) => {
      if (event.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !mobileMenu.hidden) {
        setMenu(false);
        menuToggle.focus();
      }
    });
    window.addEventListener('resize', () => {
      if (menuToggle.offsetParent === null) setMenu(false);
    });
  }

  const replay = document.getElementById('replay-motion');
  const motionCards = [...document.querySelectorAll('.kit-motion-card')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Map();
  function stopAnimations() {
    animations.forEach((animation) => animation.cancel());
    animations.clear();
    motionCards.forEach((card) => card.classList.remove('is-replaying'));
  }
  replay?.addEventListener('click', () => {
    stopAnimations();
    if (reduceMotion.matches) {
      notify('Анимация отключена согласно настройке уменьшения движения.');
      return;
    }
    motionCards.forEach((card, index) => {
      if (!card.animate) return;
      card.classList.add('is-replaying');
      const animation = card.animate([
        { opacity: 0, transform: 'translateY(24px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 750, delay: index * 90, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
      animations.set(card, animation);
      animation.addEventListener('finish', () => {
        card.classList.remove('is-replaying');
        animations.delete(card);
      });
    });
  });
  reduceMotion.addEventListener('change', (event) => { if (event.matches) stopAnimations(); });
})();
