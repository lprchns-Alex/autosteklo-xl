/* Scroll maps directly to scene state: scrolling back exactly reverses assembly. */
(() => {
  'use strict';
  const section = document.querySelector('[data-car-scene]');
  if (!section) return;
  const stage = section.querySelector('.car-scene-stage');
  const vehicle = section.querySelector('.car-scene-vehicle');
  const photo = section.querySelector('.car-scene-car');
  const panes = [...section.querySelectorAll('[data-glass-pane]')];
  const steps = [...section.querySelectorAll('.car-scene-steps li')];
  if (!stage || !vehicle || !photo || !panes.length) return;

  const root = document.documentElement;
  const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileQuery = window.matchMedia('(max-width: 760px)');
  const paneMotion = [
    { x: -250, y: 65, rotation: -28, cx: 220, cy: 245, start: .03, end: .30 },
    { x: -250, y: -115, rotation: -19, cx: 320, cy: 260, start: .10, end: .38 },
    { x: -145, y: -230, rotation: -13, cx: 465, cy: 275, start: .18, end: .48 },
    { x: 125, y: -265, rotation: 9, cx: 850, cy: 310, start: .25, end: .60 }
  ];
  let frame = 0;
  let inRange = !('IntersectionObserver' in window);
  let ready = false;
  let paused = false;
  let reduced = false;
  let activeStep = -1;
  let lastProgress = -1;
  const clamp = (value, low = 0, high = 1) => Math.min(high, Math.max(low, value));
  const ease = value => { const p = clamp(value); return p * p * (3 - 2 * p); };

  function draw(progress) {
    if (Math.abs(progress - lastProgress) < .0001) return;
    lastProgress = progress;
    const drive = ease((progress - .62) / .38);
    const endScale = mobileQuery.matches ? 1.22 : 1.48;
    const endY = mobileQuery.matches ? 24 : 35;
    vehicle.style.transform = `translate3d(${(-20 + drive * 20).toFixed(2)}px,${(-8 + drive * (endY + 8)).toFixed(2)}px,0) scale(${(.80 + drive * (endScale - .80)).toFixed(4)})`;
    panes.forEach((pane, index) => {
      const motion = paneMotion[index];
      if (!motion) return;
      const distance = 1 - ease((progress - motion.start) / (motion.end - motion.start));
      pane.setAttribute('transform', `translate(${(motion.x * distance).toFixed(2)} ${(motion.y * distance).toFixed(2)}) rotate(${(motion.rotation * distance).toFixed(2)} ${motion.cx} ${motion.cy})`);
      pane.style.opacity = String(.78 + (1 - distance) * .22);
    });
    const nextStep = progress < .20 ? 0 : progress < .63 ? 1 : 2;
    if (nextStep !== activeStep) {
      activeStep = nextStep;
      steps.forEach((step, index) => {
        step.classList.toggle('is-current', index === nextStep);
        if (index === nextStep) step.setAttribute('aria-current', 'step');
        else step.removeAttribute('aria-current');
      });
    }
  }

  function render() {
    frame = 0;
    if (!ready || paused || reduced || document.hidden || !inRange) return;
    const rect = section.getBoundingClientRect();
    const stickyTop = Number.parseFloat(getComputedStyle(stage).top) || 0;
    const travel = Math.max(1, section.offsetHeight - stage.offsetHeight);
    draw(clamp((stickyTop - rect.top) / travel));
  }

  function requestRender() {
    if (!frame && ready && !paused && !reduced && !document.hidden && inRange) {
      frame = window.requestAnimationFrame(render);
    }
  }

  function syncPreferences() {
    paused = root.classList.contains('motion-paused');
    reduced = reducedQuery.matches || root.classList.contains('motion-reduced');
    section.classList.toggle('is-reduced', reduced);
    if (paused || reduced) {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    }
    if (reduced || (paused && lastProgress < 0)) draw(.64);
    else if (!paused) requestRender();
  }

  function start() {
    if (ready || !photo.naturalWidth) return;
    ready = true;
    section.classList.add('car-scene--active');
    syncPreferences();
    requestRender();
  }

  // The ordinary HTML is a complete, assembled car when JS is off or the image fails.
  if (photo.complete && photo.naturalWidth) start();
  else photo.addEventListener('load', start, { once: true });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      inRange = entries[0].isIntersecting;
      if (!inRange && frame) { window.cancelAnimationFrame(frame); frame = 0; }
      if (inRange) requestRender();
    }, { rootMargin: '100% 0px' });
    observer.observe(section);
  }
  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', () => { lastProgress = -1; requestRender(); }, { passive: true });
  window.addEventListener('pageshow', requestRender);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && frame) { window.cancelAnimationFrame(frame); frame = 0; }
    else requestRender();
  });
  if (reducedQuery.addEventListener) reducedQuery.addEventListener('change', syncPreferences);
  else reducedQuery.addListener(syncPreferences);
  new MutationObserver(syncPreferences).observe(root, { attributes: true, attributeFilter: ['class'] });
  if ('ResizeObserver' in window) new ResizeObserver(requestRender).observe(stage);
})();
