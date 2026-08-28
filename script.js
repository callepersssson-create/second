document.getElementById('year').textContent = new Date().getFullYear();

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('main-nav');
if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Order form
const ORDER_EMAIL = 'bestallning@pizzeriaesila.se'; // OBS: platshållare - byt ut mot restaurangens riktiga beställningsmejl
const OPEN_TIME = '11:00';
const LAST_PICKUP_TIME = '19:45';

const orderForm = document.getElementById('orderForm');
const dateInput = document.getElementById('date');
const errorBox = document.getElementById('formError');

if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
}

function clearError() {
  errorBox.hidden = true;
  errorBox.textContent = '';
}

if (orderForm) {
  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    clearError();

    const data = new FormData(orderForm);
    const name = data.get('name').trim();
    const phone = data.get('phone').trim();
    const order = data.get('order').trim();
    const date = data.get('date');
    const time = data.get('time');
    const notes = data.get('notes').trim();

    if (!name || !phone || !order || !date || !time) {
      showError('Fyll i alla obligatoriska fält (markerade med *).');
      return;
    }

    if (time < OPEN_TIME || time > LAST_PICKUP_TIME) {
      showError(`Välj en hämtningstid mellan ${OPEN_TIME} och ${LAST_PICKUP_TIME}.`);
      return;
    }

    const selectedDate = new Date(`${date}T${time}`);
    if (selectedDate.getTime() < Date.now()) {
      showError('Vald tid har redan passerat. Välj en tid längre fram.');
      return;
    }

    const subject = `Avhämtningsbeställning – ${name} (${date} ${time})`;
    const bodyLines = [
      `Namn: ${name}`,
      `Telefon: ${phone}`,
      `Hämtningsdatum: ${date}`,
      `Hämtningstid: ${time}`,
      '',
      'Beställning:',
      order,
    ];
    if (notes) {
      bodyLines.push('', `Allergier/övrigt: ${notes}`);
    }

    const mailtoUrl = `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
    window.location.href = mailtoUrl;
  });
}
