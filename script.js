class MobileMenu {
  constructor() {
    this.menuToggle = document.querySelector('.menu-toggle');
    this.navList = document.querySelector('.nav-list');
    this.body = document.body;
    this.init();
  }

  init() {
    this.addEventListeners();
  }

  addEventListeners() {
    this.menuToggle.addEventListener('click', (e) => this.toggleMenu(e));
    document.addEventListener('click', (e) => this.handleOutsideClick(e));
    window.addEventListener('resize', () => this.handleResize());
  }

  toggleMenu(e) {
    e.stopPropagation();
    this.menuToggle.classList.toggle('active');
    this.navList.classList.toggle('active');
    this.body.style.overflow = this.navList.classList.contains('active') ? 'hidden' : 'auto';
  }

  handleOutsideClick(e) {
    if (!e.target.closest('.nav') && !e.target.closest('.menu-toggle')) {
      this.closeMenu();
    }
  }

  handleResize() {
    if (window.innerWidth > 768) {
      this.closeMenu();
    }
  }

  closeMenu() {
    this.menuToggle.classList.remove('active');
    this.navList.classList.remove('active');
    this.body.style.overflow = 'auto';
  }
}

class NewsFetcher {
  constructor() {
    this.config = {
      API_KEY: '51c83cd1198f1a137e448732abf813ef',
      API_ENDPOINT: 'https://gnews.io/api/v4/top-headlines',
      CACHE_TTL: 300000,
      DEFAULT_LANG: 'hi'
    };
    this.cache = new Map();
    this.state = {
      currentCategory: 'general',
      isFetching: false
    };
  }

  async fetchNews(category) {
    if (this.state.isFetching) return;
    this.state.isFetching = true;

    const cacheKey = `${category}_${new Date().getMinutes()}`;
    
    try {
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const response = await fetch(
        `${this.config.API_ENDPOINT}?category=${category}&country=in&lang=${this.config.DEFAULT_LANG}&token=${this.config.API_KEY}`
      );

      if (!response.ok) throw new Error('API Error');
      
      const data = await response.json();
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('News fetch error:', error);
      throw error;
    } finally {
      this.state.isFetching = false;
    }
  }
}

class UIUpdater {
  constructor() {
    this.newsContainer = document.getElementById('news-container');
    this.featuredSection = document.querySelector('.featured-news');
    this.categoryTitle = document.getElementById('category-title');
    this.navLinks = document.querySelectorAll('.nav-link');
  }

  async updateUI(data, category) {
    try {
      this.showLoader();
      this.updateActiveCategory(category);
      
      const featuredArticle = data.articles[0];
      this.updateFeaturedArticle(featuredArticle);
      this.updateNewsGrid(data.articles.slice(1));
    } catch (error) {
      this.showError();
    }
  }

  updateFeaturedArticle(article) {
    this.featuredSection.innerHTML = `
      <div class="featured-card">
        <div class="featured-content">
          <span class="category-tag">${article.source.name}</span>
          <h2>${this.sanitizeHTML(article.title)}</h2>
          <p>${this.sanitizeHTML(article.description || 'विवरण के लिए पूरा लेख पढ़ें')}</p>
          <a href="${this.sanitizeHTML(article.url)}" target="_blank" rel="noopener" class="read-more">
            पूरा लेख पढ़ें →
          </a>
        </div>
        <div class="featured-media">
          <img src="${article.image || 'placeholder.jpg'}" 
               alt="${this.sanitizeHTML(article.title)}"
               loading="lazy"
               class="featured-image">
        </div>
      </div>
    `;
  }

  updateNewsGrid(articles) {
    this.newsContainer.innerHTML = articles.map(article => `
      <article class="news-card">
        <div class="news-image">
          <img src="${article.image || 'placeholder.jpg'}" 
               alt="${this.sanitizeHTML(article.title)}"
               loading="lazy">
        </div>
        <div class="news-content">
          <h3>${this.sanitizeHTML(article.title)}</h3>
          <p>${this.sanitizeHTML(article.description || '')}</p>
          <div class="article-meta">
            <span class="source">${this.sanitizeHTML(article.source.name)}</span>
            <span class="published-at">${new Date(article.publishedAt).toLocaleDateString('hi-IN')}</span>
          </div>
          <a href="${this.sanitizeHTML(article.url)}" target="_blank" rel="noopener" class="read-more">
            अधिक पढ़ें →
          </a>
        </div>
      </article>
    `).join('');
  }

  sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  showLoader() {
    this.newsContainer.innerHTML = `
      <div class="loader">
        <div class="spinner"></div>
        समाचार लोड हो रहे हैं...
      </div>
    `;
  }

  showError() {
    this.newsContainer.innerHTML = `
      <div class="error-message">
        <h3>⚠️ समाचार लोड नहीं हो पाए</h3>
        <p>कृपया बाद में पुनः प्रयास करें</p>
        <button onclick="window.location.reload()">पुनः लोड करें</button>
      </div>
    `;
  }

  updateActiveCategory(category) {
    this.navLinks.forEach(link => {
      const isActive = link.dataset.category === category;
      link.classList.toggle('active', isActive);
      link.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
    this.categoryTitle.textContent = `${category} समाचार`;
  }
}

class LanguageSwitcher {
  constructor() {
    this.buttons = document.querySelectorAll('.lang-btn');
    this.init();
  }

  init() {
    this.buttons.forEach(button => {
      button.addEventListener('click', (e) => this.handleLanguageChange(e));
    });
  }

  handleLanguageChange(e) {
    const lang = e.target.dataset.lang;
    this.buttons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    document.documentElement.lang = lang;
    // Add language change logic here
  }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  try {
    const mobileMenu = new MobileMenu();
    const newsFetcher = new NewsFetcher();
    const uiUpdater = new UIUpdater();
    const languageSwitcher = new LanguageSwitcher();

    // Handle category clicks
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', async (e) => {
        e.preventDefault();
        const category = e.target.dataset.category;
        try {
          const data = await newsFetcher.fetchNews(category);
          uiUpdater.updateUI(data, category);
        } catch (error) {
          uiUpdater.showError();
        }
      });
    });

    // Auto-refresh news
    setInterval(async () => {
      if (!document.hidden) {
        try {
          const data = await newsFetcher.fetchNews(newsFetcher.state.currentCategory);
          uiUpdater.updateUI(data, newsFetcher.state.currentCategory);
        } catch (error) {
          console.error('Auto-refresh failed:', error);
        }
      }
    }, 1800000);

    // Initial load
    newsFetcher.fetchNews('general')
      .then(data => uiUpdater.updateUI(data, 'general'))
      .catch(error => uiUpdater.showError());

  } catch (error) {
    console.error('Initialization error:', error);
    document.body.innerHTML = `
      <div class="error-message">
        <h3>⚠️ एप्लिकेशन लोड नहीं हो पाया</h3>
        <p>कृपया पेज रीलोड करें या बाद में पुनः प्रयास करें</p>
        <button onclick="window.location.reload()">पुनः लोड करें</button>
      </div>
    `;
  }
});
