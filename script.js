// Configuration
const CONFIG = {
    API_KEY: '51c83cd1198f1a137e448732abf813ef',
    API_ENDPOINT: 'https://gnews.io/api/v4/top-headlines',
    PLACEHOLDER_IMAGE: 'data:image/png;base64,iVBORw0KGgo...', 
    CATEGORIES: {
        general: { title: 'Top Stories', endpoint: 'general' },
        politics: { title: 'Politics', endpoint: 'politics' },
        technology: { title: 'Technology', endpoint: 'technology' },
        entertainment: { title: 'Entertainment', endpoint: 'entertainment' },
        sports: { title: 'Sports', endpoint: 'sports' }
    },
    CACHE_TTL: 300000 // 5 minutes
};

// State Management
let state = {
    currentCategory: 'general',
    cache: new Map(),
    isFetching: false
};

// DOM Elements
const dom = {
    newsContainer: document.getElementById('news-container'),
    featuredSection: document.querySelector('.featured-news'),
    categoryTitle: document.getElementById('category-title'),
    navLinks: document.querySelectorAll('.nav-link'),
    menuToggle: document.querySelector('.menu-toggle'),
    navList: document.querySelector('.nav-list')
};

// Sanitization Helper
const sanitizeHTML = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

// API Service
const newsService = {
    async fetchNews(category) {
        const cacheKey = `${category}_${new Date().getMinutes()}`;
        
        if (state.cache.has(cacheKey)) {
            return state.cache.get(cacheKey);
        }

        try {
            const response = await fetch(
                `${CONFIG.API_ENDPOINT}?category=${category}&token=${CONFIG.51c83cd1198f1a137e448732abf813ef}&lang=en`
            );
            
            if (!response.ok) throw new Error('API Error');
            
            const data = await response.json();
            state.cache.set(cacheKey, data);
            
            return data;
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }
};

// UI Components
const uiComponents = {
    showLoader() {
        dom.newsContainer.innerHTML = `
            <div class="loader">
                <div class="spinner"></div>
                Loading latest news...
            </div>
        `;
    },

    createFeaturedCard(article) {
        return `
            <div class="featured-card">
                <div class="featured-content">
                    <span class="category-tag">
                        ${sanitizeHTML(CONFIG.CATEGORIES[state.currentCategory].title)}
                    </span>
                    <h2>${sanitizeHTML(article.title)}</h2>
                    <p>${sanitizeHTML(article.description || 'Read full story for details')}</p>
                    <a href="${sanitizeHTML(article.url)}" 
                       target="_blank" 
                       rel="noopener"
                       class="read-more">
                        Read Full Article →
                    </a>
                </div>
                <div class="featured-media">
                    <img src="${article.image || CONFIG.PLACEHOLDER_IMAGE}" 
                         alt="${sanitizeHTML(article.title)}"
                         onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                </div>
            </div>
        `;
    },

    createNewsCard(article) {
        return `
            <article class="news-card" aria-label="${sanitizeHTML(article.title)}">
                <div class="news-image">
                    <img src="${article.image || CONFIG.PLACEHOLDER_IMAGE}" 
                         alt="${sanitizeHTML(article.title)}"
                         loading="lazy"
                         onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                </div>
                <div class="news-content">
                    <h3>${sanitizeHTML(article.title)}</h3>
                    <p>${sanitizeHTML(article.description || '')}</p>
                    <div class="article-meta">
                        <span class="source">${sanitizeHTML(article.source.name)}</span>
                        <span class="published-at">
                            ${new Date(article.publishedAt).toLocaleDateString()}
                        </span>
                    </div>
                    <a href="${sanitizeHTML(article.url)}" 
                       target="_blank" 
                       rel="noopener"
                       class="read-more">
                        Read More →
                    </a>
                </div>
            </article>
        `;
    }
};

// Event Handlers
const eventHandlers = {
    handleCategoryClick: (e) => {
        e.preventDefault();
        const category = e.target.dataset.category;
        
        if (state.isFetching || category === state.currentCategory) return;
        
        state.currentCategory = category;
        newsController.loadCategoryNews();
    },

    handleMenuToggle: () => {
        dom.navList.classList.toggle('active');
        dom.menuToggle.setAttribute('aria-expanded', 
            dom.navList.classList.contains('active'));
    }
};

// Main Controller
const newsController = {
    async loadCategoryNews() {
        try {
            state.isFetching = true;
            uiComponents.showLoader();
            this.updateActiveCategory();
            
            const data = await newsService.fetchNews(state.currentCategory);
            
            dom.featuredSection.innerHTML = uiComponents.createFeaturedCard(data.articles[0]);
            dom.newsContainer.innerHTML = data.articles.slice(1).map(uiComponents.createNewsCard).join('');
            
        } catch (error) {
            dom.newsContainer.innerHTML = `
                <div class="error-message" role="alert">
                    <h3>⚠️ News unavailable</h3>
                    <p>Please try again later</p>
                    <button onclick="newsController.loadCategoryNews()">Retry</button>
                </div>
            `;
        } finally {
            state.isFetching = false;
        }
    },

    updateActiveCategory() {
        dom.navLinks.forEach(link => {
            const isActive = link.dataset.category === state.currentCategory;
            link.classList.toggle('active', isActive);
            link.setAttribute('aria-current', isActive ? 'page' : 'false');
        });
        
        dom.categoryTitle.textContent = 
            `${CONFIG.CATEGORIES[state.currentCategory].title} News`;
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Event Listeners
    dom.navLinks.forEach(link => {
        link.addEventListener('click', eventHandlers.handleCategoryClick);
    });
    
    dom.menuToggle.addEventListener('click', eventHandlers.handleMenuToggle);
    
    // Initial Load
    newsController.loadCategoryNews();
    
    // Auto-refresh
    setInterval(() => {
        if (!document.hidden) newsController.loadCategoryNews();
    }, 1800000);
});
