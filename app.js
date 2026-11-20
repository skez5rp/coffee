const scene = document.querySelector('#scene');
const partButtons = [...document.querySelectorAll('.part')];
const selected = new Set(['door']);
const status = document.querySelector('#build-status');
const form = document.querySelector('#brief-form');
const colorSelect = document.querySelector('#door-color');

function updateOrderDesign() {
  const names = partButtons
    .filter(button => selected.has(button.dataset.part))
    .map(button => button.querySelector('small').textContent.trim());
  const description = names.join(', ');
  document.querySelector('#selected-parts').value = description;
  document.querySelector('#order-parts').textContent = description;
  document.querySelector('#order-color').textContent = colorSelect.value.toLowerCase();
  scene.dataset.color = colorSelect.selectedOptions[0].dataset.color;
}

function renderCollection() {
  for (const button of partButtons) {
    const part = button.dataset.part;
    const active = selected.has(part);
    button.setAttribute('aria-pressed', String(active));
    button.querySelector('.part-check').textContent = active ? '✓' : '+';
    scene.classList.toggle(`has-${part}`, active);
  }
  document.querySelector('#progress').style.width = `${selected.size * 20}%`;
  status.textContent = selected.size === 5
    ? 'Домик собран! В акции кафе это момент получения подарка. Например, бесплатного напитка.'
    : `${selected.size} из 5 деталей. История продолжается.`;
  updateOrderDesign();
}

for (const button of partButtons) {
  button.addEventListener('click', () => {
    const part = button.dataset.part;
    if (part === 'door') {
      status.textContent = 'Дом и дверь — основа коллекции. Добавьте навес, столик, зелень или кота.';
      return;
    }
    if (selected.has(part)) {
      selected.delete(part);
    } else {
      selected.add(part);
    }
    renderCollection();
  });
}

document.querySelector('#reset').addEventListener('click', () => {
  selected.clear();
  selected.add('door');
  renderCollection();
});
colorSelect.addEventListener('change', updateOrderDesign);

for (const field of form.querySelectorAll('input[required], textarea[required]')) {
  field.addEventListener('input', () => field.setCustomValidity(''));
}

form.addEventListener('submit', event => {
  updateOrderDesign();
  for (const field of form.querySelectorAll('input[required], textarea[required]')) {
    field.value = field.value.trim();
    field.setCustomValidity(field.value ? '' : 'Заполните это поле.');
  }
  if (!form.reportValidity()) {
    event.preventDefault();
  }
});

// Restore the visible preview after returning from the form provider.
window.addEventListener('pageshow', updateOrderDesign);
renderCollection();

// Let a visitor send the same request using their own mail application.
document.querySelector('#mail-fallback').addEventListener('click', () => {
  updateOrderDesign();
  for (const field of form.querySelectorAll('input[required], textarea[required]')) {
    field.value = field.value.trim();
    field.setCustomValidity(field.value ? '' : 'Заполните это поле.');
  }
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const fields = [
    ['Имя', 'name'],
    ['Почта для ответа', 'email'],
    ['Кофейня', 'Название кофейни'],
    ['Дизайн', 'Пожелания к дизайну'],
    ['Фото или страница кафе', 'Фото или страница кафе'],
    ['Детали', 'Выбранные детали'],
    ['Цвет двери', 'Цвет двери'],
    ['Количество', 'Количество миниатюр'],
    ['Размер коллекции', 'Размер коллекции'],
  ];
  const body = fields.map(([label, name]) => `${label}: ${data.get(name) || 'Не указано'}`).join('\n\n');
  const subject = 'Кофейный город — заявка на миниатюру';
  window.location.href = `mailto:tikhonkobz@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  document.querySelector('#mail-status').textContent = 'Заявка подготовлена. Завершите отправку в вашей почтовой программе. Если она не открылась, напишите на tikhonkobz@gmail.com.';
});
