(function () {
  const globalConfig = window.UchitelTutWidget || {};
  const endpoint = globalConfig.endpoint || 'http://localhost:4001/chat';
  const title = globalConfig.title || 'Учитель Тут';
  const greeting =
    globalConfig.greeting ||
    'Привет! Я помогу найти подходящую вакансию. Напишите, что ищете.';
  const position = (globalConfig.position || 'right').toLowerCase();
  const storageKey = 'uchiteltut-session-id';

  injectStyles();
  const root = document.createElement('div');
  root.className = `uchiteltut-widget ${position === 'left' ? 'left' : ''}`;

  const panel = createPanel();
  const toggleButton = createToggleButton();

  root.appendChild(panel);
  root.appendChild(toggleButton);
  document.body.appendChild(root);

  const messagesList = panel.querySelector('.uchiteltut-widget__messages');
  const form = panel.querySelector('.uchiteltut-widget__form');
  const input = form.querySelector('input');

  appendMessage('bot', greeting);

  toggleButton.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) {
      input.focus();
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    appendMessage('user', text);
    await sendMessage(text);
  });

  async function sendMessage(message) {
    const payload = {
      sessionId: getSessionId(),
      message,
    };
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error('Network error');
      }
      const data = await response.json();
      if (data.sessionId) {
        localStorage.setItem(storageKey, data.sessionId);
      }
      renderAnswer(data.answer);
    } catch (error) {
      console.error(error);
      appendMessage('bot', 'Не удалось связаться с сервисом. Попробуйте позже.');
    }
  }

  function renderAnswer(answer) {
    if (answer?.message) {
      appendMessage('bot', answer.message);
    }
    if (answer?.choices?.length) {
      appendMessage('bot', 'Варианты: ' + answer.choices.join(', '));
    }
    if (answer?.vacancies?.length) {
      answer.vacancies.forEach((vacancy) => appendVacancy(vacancy));
    }
    scrollToBottom();
  }

  function appendMessage(role, text) {
    const bubble = document.createElement('div');
    bubble.className = `uchiteltut-widget__message uchiteltut-widget__message--${role}`;
    bubble.innerText = text;
    messagesList.appendChild(bubble);
    scrollToBottom();
  }

  function appendVacancy(vacancy) {
    const bubble = document.createElement('div');
    bubble.className = 'uchiteltut-widget__message uchiteltut-widget__message--bot';

    const summary =
      vacancy.summary ||
      `${vacancy.title} — ${vacancy.organization} (${vacancy.district})`;
    const summaryEl = document.createElement('div');
    summaryEl.textContent = summary;
    bubble.appendChild(summaryEl);

    if (vacancy.salary) {
      const salaryEl = document.createElement('div');
      salaryEl.style.marginTop = '4px';
      salaryEl.style.fontSize = '13px';
      salaryEl.style.color = '#475569';
      salaryEl.textContent = vacancy.salary;
      bubble.appendChild(salaryEl);
    }

    if (vacancy.sourceUrl) {
      const link = document.createElement('a');
      // Если URL относительный, добавляем базовый путь
      link.href = vacancy.sourceUrl.startsWith('/') 
        ? vacancy.sourceUrl 
        : vacancy.sourceUrl.startsWith('http') 
        ? vacancy.sourceUrl 
        : '/' + vacancy.sourceUrl;
      link.target = vacancy.sourceUrl.startsWith('http') ? '_blank' : '_self';
      link.rel = 'noopener noreferrer';
      link.style.display = 'inline-block';
      link.style.marginTop = '8px';
      link.style.color = '#2563eb';
      link.style.textDecoration = 'none';
      link.style.fontWeight = '500';
      link.textContent = 'Открыть вакансию';
      // Обработка клика для относительных ссылок (SPA routing)
      if (!vacancy.sourceUrl.startsWith('http')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          if (window.ReactRouter && window.ReactRouter.navigate) {
            window.ReactRouter.navigate(link.href);
          } else {
            window.location.href = link.href;
          }
        });
      }
      bubble.appendChild(link);
    }

    messagesList.appendChild(bubble);
    scrollToBottom();
  }

  function scrollToBottom() {
    messagesList.scrollTop = messagesList.scrollHeight;
  }

  function getSessionId() {
    return localStorage.getItem(storageKey) || undefined;
  }

  function createToggleButton() {
    const button = document.createElement('button');
    button.className = 'uchiteltut-widget__button';
    button.type = 'button';
    button.innerText = 'Найти вакансию';
    return button;
  }

  function createPanel() {
    const panelEl = document.createElement('div');
    panelEl.className = 'uchiteltut-widget__panel';
    panelEl.innerHTML = `
      <div class="uchiteltut-widget__header">
        <strong>${title}</strong>
        <p style="margin:4px 0 0; font-size:13px; opacity:.9;">${greeting}</p>
      </div>
      <div class="uchiteltut-widget__messages"></div>
      <form class="uchiteltut-widget__form">
        <input type="text" placeholder="Напишите запрос..." aria-label="Сообщение" />
        <button type="submit">Отправить</button>
      </form>
    `;
    return panelEl;
  }

  function injectStyles() {
    if (document.getElementById('uchiteltut-widget-style')) return;
    const link = document.createElement('link');
    link.id = 'uchiteltut-widget-style';
    link.rel = 'stylesheet';
    link.href = globalConfig.stylesheet || '/widget.css';
    document.head.appendChild(link);
  }
})();
