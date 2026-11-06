(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const dialog = $('#detail-dialog');
  const dialogContent = $('#dialog-content');
  const form = $('#booking-form');
  const mobileMenu = $('#mobile-nav');
  const menuToggle = $('.menu-toggle');
  let requestContext = '';
  let toastTimer;
  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const diagonal = '<svg aria-hidden="true"><use href="#diagonal"/></svg>';

  const services = [
    ['Автостекла для автомобилей', 'Подбор и установка', 'Подберём лобовое, боковое или заднее стекло с учётом марки, модели, года выпуска и комплектации. Согласуем производителя и стоимость до установки.'],
    ['Детейлинг автомобиля', 'Уход за каждой поверхностью', 'Подберём комплекс ухода за кузовом и салоном: очистку, полировку и защиту поверхностей. Состав работ зависит от состояния автомобиля.'],
    ['Тонирование автостекол', 'Комфорт в каждой поездке', 'Поможем подобрать плёнку и согласуем область нанесения. Уточните доступные варианты и стоимость для вашего автомобиля.'],
    ['Оклейка кузова', 'Защита кузова и оптики', 'Обсудим защиту уязвимых поверхностей автомобиля. Подберём материал и зоны оклейки под ваши задачи.'],
    ['Шиномонтаж', 'Готовность к новому сезону', 'Сезонная смена колёс и шиномонтаж. Перед визитом уточним размер колёс, необходимые работы и удобный центр.'],
    ['Ремонт стекол', 'Сколы и трещины', 'Оценим повреждение и возможность ремонта. Стоимость зависит от размера и характера скола или трещины. Окончательное решение мастер принимает после осмотра.'],
    ['Полировка кузова', 'Возвращаем глубину цвета', 'Осмотрим лакокрасочное покрытие и предложим подходящую обработку. Объём работ и ожидаемый результат согласуем заранее.'],
    ['Шины и диски', 'Подбор для вашего автомобиля', 'Уточним необходимые параметры и доступность шин или дисков. Сообщите модель автомобиля, размер и пожелания.'],
    ['Ремонт вмятин без покраски', 'Внимание к геометрии кузова', 'Оценим возможность устранения вмятины и подходящую технологию ремонта. Возможность сохранения покрытия зависит от характера повреждения.'],
    ['Химчистка салона', 'Свежесть и чистота внутри', 'Подберём обработку для обивки, пластика и других поверхностей. Уточните материалы салона и участки, которым нужно особое внимание.'],
    ['Заправка кондиционеров', 'Комфортная температура', 'Уточним модель автомобиля, состояние системы и необходимый объём обслуживания. Доступность услуги согласуем с выбранным центром.'],
    ['Шумоизоляция', 'Больше тишины в дороге', 'Обсудим зоны обработки и желаемый результат. Подберём решение с учётом автомобиля и бюджета.'],
    ['Полировка фар', 'Уход за автомобильной оптикой', 'Оценим состояние поверхности фар и возможность полировки. Мастер объяснит, какого результата можно ожидать.'],
    ['Обучение мастеров', 'Передаём практический опыт', 'Уточните программу, ближайшие даты и условия обучения ремонту и замене автомобильных стёкол.']
  ];

  $('#service-list').innerHTML = services.slice(2).map(([name, subtitle], index) => `
    <button class="service-item" data-service="${index + 2}">
      <span class="mono">${String(index + 3).padStart(2, '0')}</span><div><h3>${name}</h3><p>${subtitle}</p></div>${diagonal}
    </button>`).join('');

  const centers = [
    { name: 'Бирюлёво', address: 'Москва, МКАД, 29-й км, вл. 7, стр. 2, АЗС «Роснефть»', phone: '+7 901 569-81-91', tel: '+79015698191', email: 'avtosteklo.rf@yandex.ru' },
    { name: 'Домодедово', address: 'Московская область, д. Заболотье, д. 100, корп. 2', phone: '+7 925 532-32-42', tel: '+79255323242', email: 'xl9255323242@yandex.ru' },
    { name: 'Троицк', address: 'Москва, Красная Пахра, Калужское шоссе, 43-й км, АЗС «Роснефть»', phone: '+7 906 033-40-07', tel: '+79060334007', email: '89060334007@mail.ru' },
    { name: 'Измайлово', address: 'Московская область, рабочий посёлок Измайлово, вл. 12Ю', phone: '+7 901 517-19-14', tel: '+79015171914', email: 'avtosteklo.rf@yandex.ru' },
    { name: 'Оптовый отдел', address: 'Московская область, рабочий посёлок Измайлово, вл. 12Ю', phone: '+7 906 033-40-01', tel: '+79060334001', email: 'avtosteklo.rf@yandex.ru', wholesale: true }
  ];

  const maxContacts = [
  {
    "name": "Оптовый отдел",
    "url": "https://max.ru/u/f9LHodD0cOIUssvlraUZ8FDAlZ2sfllAkCK0DYMeOTBAHm1FtWQFyc_rHH4"
  },
  {
    "name": "Измайлово",
    "url": "https://max.ru/u/f9LHodD0cOJDQtaDMS1fwiE8l3ei8m_lPpX6yFwFnLg_X2DBBCDGd-716KM"
  },
  {
    "name": "Домодедово / Подольск",
    "url": "https://max.ru/u/f9LHodD0cOLQa04eXokFxbl1Srhufi-LLXxWEvSo3Fs5g8r5eZosjGMHW-M"
  },
  {
    "name": "Троицк, ТиНАО",
    "url": "https://max.ru/u/f9LHodD0cOKESTCIU3nKZcvrxEchEeswDsQB3yyyHNNUrSGIQ-cR9lhiDS0"
  },
  {
    "name": "Бирюлёво, ЮАО",
    "url": "https://max.ru/u/f9LHodD0cOKr3DAJzxenb-Qz2guLE6v56pTkcvzai14PA_L7n_oQTtPJn2E"
  }
];

  function closeMenu() {
    mobileMenu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Открыть меню');
  }

  function openDialog(eyebrow, title, content) {
    closeMenu();
    dialogContent.innerHTML = `<span class="dialog-eyebrow">${eyebrow}</span><h2 class="dialog-title" id="dialog-title">${title}</h2>${content}`;
    dialog.showModal();
  }

  function goToBooking(context) {
    requestContext = context || '';
    if (dialog.open) dialog.close();
    closeMenu();
    form.elements.service.selectedIndex = /скол|трещин|Ремонт автостекла|Ремонт стекол/i.test(context) ? 1 : /купить|оптов/i.test(context) ? 2 : /детейлинг|плёнк|оклейк|полиров|тонир|шиномонтаж|шины|вмятин|химчист|кондиционер|шумоизоляц/i.test(context) ? 3 : /обучени|сертификат/i.test(context) ? 4 : 0;
    $('#booking').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    form.elements.name.focus({ preventScroll: true });
  }

  document.addEventListener('click', (event) => {
    const book = event.target.closest('[data-book]');
    if (book) { goToBooking(book.dataset.book); return; }

    const service = event.target.closest('[data-service]');
    if (service) {
      const [name, subtitle, description] = services[Number(service.dataset.service)];
      openDialog('Наши услуги / ' + subtitle, name, `<p class="dialog-description">${description}</p><div class="dialog-actions"><button class="btn accent" data-book="${name}">Обсудить с мастером ${diagonal}</button><a class="btn dark" href="tel:+74957987888">Позвонить</a></div>`);
      return;
    }

    const center = event.target.closest('[data-center]');
    if (center) {
      const info = centers[Number(center.dataset.center)];
      openDialog(info.wholesale ? 'Для бизнеса' : 'Установочный центр', info.name, `<p class="dialog-description">${info.address}</p><div class="dialog-details"><p>${info.wholesale ? 'График работы уточняйте по телефону.' : 'Ежедневно · 09:00–21:00'}</p><p><a href="tel:${info.tel}">${info.phone}</a></p><p><a href="mailto:${info.email}">${info.email}</a></p></div><div class="dialog-actions"><a class="btn accent" href="https://yandex.ru/maps/?text=${encodeURIComponent(info.address)}" target="_blank" rel="noopener">Открыть карту ${diagonal}</a><button class="btn dark" data-book="${info.wholesale ? 'Оптовый запрос' : 'Запись в центр'}: ${info.name}">${info.wholesale ? 'Оставить запрос' : 'Записаться'}</button></div>`);
      return;
    }

    if (event.target.closest('[data-modal="max"]')) {
      openDialog('Связаться в MAX', 'Выберите свой центр.', '<div class="messenger-centers">' + maxContacts.map(({ name, url }) => `<a href="${url}" target="_blank" rel="noopener">${name}${diagonal}</a>`).join('') + '</div>');
      return;
    }

    if (event.target.closest('[data-modal="price"]')) {
      openDialog('Ориентиры по стоимости', 'Сначала — понятный расчёт.', '<p class="dialog-description">Цены работ из прайса действующего сайта. Стекло оплачивается отдельно. Точную стоимость и актуальность предложения подтвердит менеджер.</p><div class="dialog-price"><span>Установка стекла<br><small>Пакет «Эконом», только работа</small></span><strong>от 3 000 ₽</strong></div><div class="dialog-price"><span>Ремонт автостекла</span><strong>от 1 000 ₽</strong></div><div class="dialog-price"><span>Ремонт трещины</span><strong>100 ₽ / см</strong></div><div class="dialog-actions"><button class="btn accent" data-book="Индивидуальный расчёт стоимости">Получить расчёт ' + diagonal + '</button></div>');
    }
  });

  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') !== 'true';
    mobileMenu.hidden = !expanded;
    menuToggle.setAttribute('aria-expanded', String(expanded));
    menuToggle.setAttribute('aria-label', expanded ? 'Закрыть меню' : 'Открыть меню');
  });
  mobileMenu.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });

  document.querySelectorAll('#glass-accordion details').forEach((detail) => {
    detail.addEventListener('toggle', () => {
      if (detail.open) document.querySelectorAll('#glass-accordion details').forEach((other) => { if (other !== detail) other.open = false; });
    });
  });

  function toast(text) {
    const el = $('#toast');
    el.textContent = text;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 3500);
  }

  form.elements.phone.addEventListener('input', () => form.elements.phone.setCustomValidity(''));
  form.elements.name.addEventListener('input', () => form.elements.name.setCustomValidity(''));
  form.elements.service.addEventListener('change', () => { requestContext = ''; });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const digits = form.elements.phone.value.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) {
      form.elements.phone.setCustomValidity('Введите телефон: от 10 до 15 цифр.');
      form.elements.phone.reportValidity();
      return;
    }
    if (!form.elements.name.value.trim()) {
      form.elements.name.setCustomValidity('Укажите, как к вам обращаться.');
      form.elements.name.reportValidity();
      return;
    }
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const message = ['Здравствуйте! Хочу обратиться в Автостекло.рф.', '', `Имя: ${String(data.get('name')).trim()}`, `Телефон: ${String(data.get('phone')).trim()}`, `Автомобиль: ${String(data.get('car')).trim() || 'Уточню при разговоре'}`, `Услуга: ${data.get('service')}`, ...(requestContext ? [`Запрос: ${requestContext}`] : [])].join('\n');
    const mailto = 'mailto:avtosteklo.rf@yandex.ru?subject=' + encodeURIComponent('Заявка с сайта Автостекло.рф') + '&body=' + encodeURIComponent(message);
    openDialog('Заявка подготовлена', 'Осталось отправить.', `<p class="dialog-description">Проверьте текст. Кнопка ниже откроет вашу почту с готовым письмом. Заявка ещё не отправлена.</p><div class="prepared-message">${escapeHTML(message)}</div><div class="dialog-actions"><a class="btn accent" href="${escapeHTML(mailto)}">Открыть почту ${diagonal}</a><button class="btn dark" id="copy-request">Скопировать текст</button></div>`);
    $('#copy-request').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(message); toast('Текст заявки скопирован'); }
      catch {
        if (!dialogContent.querySelector('.fallback-copy')) {
          const area = document.createElement('textarea');
          area.className = 'fallback-copy'; area.value = message; area.readOnly = true;
          area.setAttribute('aria-label', 'Текст заявки для копирования');
          dialogContent.append(area); area.focus(); area.select();
        }
        toast('Выделите и скопируйте текст заявки');
      }
    });
  });

  const notice = $('#cookie-banner');
  try { notice.hidden = localStorage.getItem('avtosteklo-cookie-notice') === 'seen'; } catch { notice.hidden = false; }
  $('#cookie-accept').addEventListener('click', () => { notice.hidden = true; try { localStorage.setItem('avtosteklo-cookie-notice', 'seen'); } catch { /* The notice can still be dismissed when storage is unavailable. */ } });
  $('#cookie-settings').addEventListener('click', () => { notice.hidden = false; $('#cookie-accept').focus(); });
})();
