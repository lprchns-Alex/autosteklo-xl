(() => {
  'use strict';
  const experience = document.querySelector('#glass-experience');
  const options = [...document.querySelectorAll('[data-glass-option]')];
  const car = document.querySelector('#glass-car');
  const transfer = document.querySelector('#glass-transfer');
  const status = document.querySelector('#glass-status');
  const bookingCar = document.querySelector('#booking-form [name="car"]');
  const contacts = document.querySelector('.top-contacts');
  const desktopContacts = matchMedia('(min-width: 761px)');
  function setContacts() { contacts.open = desktopContacts.matches; }
  setContacts();
  desktopContacts.addEventListener('change', setContacts);

  function updateSelection() {
    const selected = options.filter(button => button.getAttribute('aria-pressed') === 'true');
    options.forEach(button => {
      const active = selected.includes(button);
      experience.toggleAttribute(`data-${button.dataset.glassOption}`, active);
      button.querySelector('.option-check').textContent = active ? '✓' : '+';
    });
    const names = selected.map(button => button.firstElementChild.textContent.trim());
    status.textContent = names.length ? names.join(' · ') : 'Выберите опции — стекло оживёт.';
    transfer.dataset.book = names.length ? 'Подбор стекла по выбранным опциям.' : 'Подбор стекла. Комплектацию нужно уточнить.';
  }
  options.forEach(button => button.addEventListener('click', () => {
    button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
    updateSelection();
  }));
  // Runs before the delegated booking handler in app.js.
  transfer.addEventListener('click', () => {
    bookingCar.value = car.value.trim();
    const optionNames = options.filter(button => button.getAttribute('aria-pressed') === 'true').map(button => button.firstElementChild.textContent.trim()).join(', ');
    document.querySelector('#booking-form [name="glass_options"]').value = optionNames;
    const summary = document.querySelector('#booking-glass-summary');
    summary.hidden = !optionNames;
    summary.textContent = optionNames ? 'Опции стекла: ' + optionNames : '';
    updateSelection();
  });
  updateSelection();
})();
