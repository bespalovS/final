const API_KEY = '27a136891fbd4dc5bc9ca2c38d08fe84';

    const newsContainer = document.getElementById('news');
    const searchInput = document.getElementById('search');
    const categorySelect = document.getElementById('category');
    const dateInput = document.getElementById('date');

    const categoryKeywords = {
      business: 'бизнес OR экономика OR финансы',
      technology: 'технологии OR IT OR искусственный интеллект',
      sports: 'спорт OR футбол OR баскетбол',
      health: 'здоровье OR медицина',
      science: 'наука OR исследования OR космос',
      entertainment: 'кино OR музыка OR развлечения'
    };

    function debounce(fn, delay = 500) {
      let t;
      return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
      };
    }

    function localDateRangeToUTC(dateStr) {
      const startLocal = new Date(dateStr + 'T00:00:00');
      const endLocal = new Date(dateStr + 'T23:59:59.999');

      const startUTC = new Date(startLocal.getTime() - startLocal.getTimezoneOffset() * 60000);
      const endUTC = new Date(endLocal.getTime() - endLocal.getTimezoneOffset() * 60000);

      return { from: startUTC.toISOString(), to: endUTC.toISOString() };
    }

    function formatDateRU_UTC(isoDate) {
      return new Date(isoDate).toLocaleDateString('ru-RU', {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    async function loadNews() {
      newsContainer.innerHTML = '<div class="loader">Загрузка новостей…</div>';

      const search = searchInput.value.trim();
      const category = categorySelect.value;
      const date = dateInput.value;

      let query = search || 'новости';
      if (category && !search) query = categoryKeywords[category];

      const params = new URLSearchParams({
        apiKey: API_KEY,
        q: query,
        language: 'ru',
        sortBy: 'publishedAt',
        pageSize: 30
      });

      if (date) {
        const { from, to } = localDateRangeToUTC(date);
        params.append('from', from);
        params.append('to', to);
      }

      try {
        const res = await fetch(`https://newsapi.org/v2/everything?${params}`);
        const data = await res.json();
        renderNews(data.articles || []);
      } catch {
        newsContainer.innerHTML = '<div class="loader">Ошибка загрузки</div>';
      }
    }

    function renderNews(articles) {
      if (!articles.length) {
        newsContainer.innerHTML = '<div class="loader">Ничего не найдено</div>';
        return;
      }

      newsContainer.innerHTML = '';

      articles.forEach(article => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          ${article.urlToImage ? `<img src="${article.urlToImage}" alt="">` : ''}
          <div class="card-content">
            <h3>${article.title}</h3>
            <p>${article.description || ''}</p>
            <div class="meta">
              <span>${article.source?.name || ''}</span>
              <span>${formatDateRU_UTC(article.publishedAt)}</span>
            </div>
            <a href="${article.url}" target="_blank">Читать далее →</a>
          </div>`;
        newsContainer.appendChild(card);
      });
    }

    const debouncedLoad = debounce(loadNews, 600);

    searchInput.addEventListener('input', debouncedLoad);
    categorySelect.addEventListener('change', loadNews);
    dateInput.addEventListener('change', loadNews);

    loadNews();