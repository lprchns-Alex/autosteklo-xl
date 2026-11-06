(() => {
  'use strict';

  const root = document.documentElement;
  const hero = document.querySelector('.hero-v3');
  const header = document.querySelector('.nav-wrap');
  const toggle = document.querySelector('#motion-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine)');
  const cards = [...document.querySelectorAll('.stack-card')];
  const reveals = [...document.querySelectorAll('[data-reveal]')];
  const counters = [...document.querySelectorAll('[data-count]')];
  const counterText = new Map(counters.map((el) => [el, el.textContent]));
  const counted = new WeakSet();
  const counting = new Map();
  const interactive = 'a,button,input,select,textarea,summary,[tabindex]';
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  let userPaused = false;
  let frame = 0;
  let hiddenAt = 0;
  let pointerX = 0;
  let pointerY = 0;
  let geometryDirty = true;
  let revealObserver;
  let countObserver;
  const motionEnabled = () => !userPaused && !reduced.matches;

  function show(el) {
    el.classList.add('is-visible');
    el.classList.remove('reveal-pending');
    revealObserver?.unobserve(el);
  }

  function resetSpatialMotion() {
    if (hero) {
      hero.style.setProperty('--hero-y', '0px');
      hero.style.setProperty('--pointer-x', '0px');
      hero.style.setProperty('--pointer-y', '0px');
    }
    cards.forEach((card) => card.style.setProperty('--stack-scale', '1'));
  }

  function finishCounters() {
    counters.forEach((el) => {
      el.textContent = counterText.get(el);
      counted.add(el);
    });
    counting.clear();
  }

  function updateGeometry() {
    header?.classList.toggle('is-scrolled', window.scrollY > 24);
    if (!motionEnabled()) return;
    if (hero) {
      const rect = hero.getBoundingClientRect();
      const visible = rect.bottom > 0 && rect.top < innerHeight;
      const y = desktop.matches && visible ? clamp(-rect.top * .12, 0, 95) : 0;
      hero.style.setProperty('--hero-y', `${y.toFixed(2)}px`);
      hero.style.setProperty('--pointer-x', `${desktop.matches ? pointerX.toFixed(2) : 0}px`);
      hero.style.setProperty('--pointer-y', `${desktop.matches ? pointerY.toFixed(2) : 0}px`);
    }
    cards.forEach((card, index) => {
      const next = cards[index + 1];
      if (!desktop.matches || !next) {
        card.style.setProperty('--stack-scale', '1');
        return;
      }
      const rect = card.getBoundingClientRect();
      const nextRect = next.getBoundingClientRect();
      const stickyTop = parseFloat(getComputedStyle(card).top) || 88;
      const progress = clamp((stickyTop + rect.height - nextRect.top) / Math.max(rect.height, 1), 0, 1);
      card.style.setProperty('--stack-scale', (1 - progress * .045).toFixed(4));
    });
  }

  function render(now) {
    frame = 0;
    if (document.hidden) return;
    if (geometryDirty) {
      updateGeometry();
      geometryDirty = false;
    }
    if (motionEnabled()) {
      counting.forEach((state, el) => {
        const progress = clamp((now - state.start) / 1100, 0, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = String(Math.round(state.value * eased));
        if (progress === 1) {
          el.textContent = counterText.get(el);
          counting.delete(el);
        }
      });
    }
    // The animation loop is finite. At rest, scroll and pointer events request one frame.
    if (counting.size) frame = requestAnimationFrame(render);
  }

  function schedule() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(render);
  }

  function onScroll() {
    geometryDirty = true;
    schedule();
  }

  function applyMotionPreference() {
    const off = !motionEnabled();
    root.classList.toggle('motion-paused', userPaused);
    root.classList.toggle('motion-reduced', reduced.matches);
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(off));
      toggle.setAttribute('aria-label', reduced.matches
        ? 'Анимация отключена в настройках устройства'
        : off ? 'Включить анимацию' : 'Приостановить анимацию');
      toggle.setAttribute('title', toggle.getAttribute('aria-label'));
      toggle.disabled = reduced.matches;
      const label = toggle.querySelector('[data-motion-label],.motion-toggle-label');
      if (label) label.textContent = off ? 'Анимация' : 'Пауза';
    }
    if (off) {
      reveals.forEach(show);
      finishCounters();
      resetSpatialMotion();
    }
    geometryDirty = true;
    schedule();
  }

  function prepareButtonLabels() {
    document.querySelectorAll('.btn').forEach((button) => {
      if (button.querySelector('.button-roll')) return;
      [...button.childNodes].forEach((node) => {
        if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) return;
        const roll = document.createElement('span');
        roll.className = 'button-roll';
        const primary = document.createElement('span');
        primary.className = 'button-roll-primary';
        primary.textContent = node.textContent.trim();
        const copy = primary.cloneNode(true);
        copy.className = 'button-roll-copy';
        copy.setAttribute('aria-hidden', 'true');
        roll.append(primary, copy);
        node.replaceWith(roll);
      });
    });
  }

  // Every section is visible without JavaScript. Only non-interactive content
  // receives the hidden starting state, and keyboard focus always reveals it.
  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => { if (isIntersecting) show(target); });
    }, { threshold: .08, rootMargin: '0px 0px -30px 0px' });
    reveals.forEach((el, index) => {
      el.style.setProperty('--reveal-delay', `${(index % 3) * 55}ms`);
      const rect = el.getBoundingClientRect();
      if (!motionEnabled() || (rect.top < innerHeight - 24 && rect.bottom > 0)) {
        show(el);
      } else {
        if (!el.matches(interactive) && !el.querySelector(interactive)) el.classList.add('reveal-pending');
        revealObserver.observe(el);
      }
    });
    countObserver = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting || counted.has(target)) return;
        counted.add(target);
        countObserver.unobserve(target);
        const value = Number(target.dataset.count);
        if (motionEnabled() && Number.isFinite(value)) {
          counting.set(target, { value, start: performance.now() });
          schedule();
        }
      });
    }, { threshold: .6 });
    counters.forEach((el) => countObserver.observe(el));
  } else {
    reveals.forEach(show);
  }

  prepareButtonLabels();
  root.classList.add('motion-ready');
  toggle?.addEventListener('click', () => {
    userPaused = !userPaused;
    applyMotionPreference();
  });
  reduced.addEventListener('change', applyMotionPreference);
  desktop.addEventListener('change', () => {
    pointerX = 0; pointerY = 0;
    onScroll();
  });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  hero?.addEventListener('pointermove', (event) => {
    if (!desktop.matches || !motionEnabled()) return;
    const rect = hero.getBoundingClientRect();
    pointerX = clamp((event.clientX - rect.left) / rect.width - .5, -.5, .5) * 14;
    pointerY = clamp((event.clientY - rect.top) / rect.height - .5, -.5, .5) * 10;
    onScroll();
  }, { passive: true });
  hero?.addEventListener('pointerleave', () => {
    pointerX = 0; pointerY = 0;
    onScroll();
  }, { passive: true });
  document.addEventListener('focusin', (event) => {
    const reveal = event.target.closest('[data-reveal]');
    if (reveal) show(reveal);
  });
  document.addEventListener('visibilitychange', () => {
    root.classList.toggle('motion-hidden', document.hidden);
    if (document.hidden) {
      hiddenAt = performance.now();
      cancelAnimationFrame(frame);
      frame = 0;
    } else {
      const pause = hiddenAt ? performance.now() - hiddenAt : 0;
      counting.forEach((state) => { state.start += pause; });
      hiddenAt = 0;
      onScroll();
    }
  });
  applyMotionPreference();
})();
