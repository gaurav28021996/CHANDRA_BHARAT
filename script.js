const API_KEY = '51c83cd1198f1a137e448732abf813ef';
const newsContainer = document.getElementById('news-container');
const featuredSection = document.querySelector('.featured-news');
let currentCategory = 'general';

// Category configuration
const categories = {
    general: 'Top Stories',
    politics: 'Politics',
    technology: 'Technology',
    entertainment: 'Entertainment',
    sports: 'Sports'
};

async function fetchGNews(category = currentCategory) {
    try {
        const response = await fetch(
            `https://gnews.io/api/v4/top-headlines?category=${category}&token=${API_KEY}&lang=en`
        );
        const data = await response.json();
        
        // Update UI
        newsContainer.innerHTML = '';
        updateActiveCategory(category);
        
        // Featured article
        const featuredArticle = data.articles[2];
        featuredSection.innerHTML = `
            <div class="featured-card">
                <div class="featured-content">
                    <span class="category-tag">${categories[category]}</span>
                    <h2>${featuredArticle.title}</h2>
                    <p>${featuredArticle.description}</p>
                    <a href="${featuredArticle.url}" target="_blank" class="read-more">Read Full Article →</a>
                </div>
                <div class="featured-image">
                    <img src="${featuredArticle.image || 'placeholder.jpg'}" 
                         alt="${featuredArticle.title}"
                         onerror="this.src='placeholder.jpg'">
                </div>
            </div>
        `;

        // Other articles
        data.articles.slice(1).forEach(article => {
            const articleCard = createArticleCard(article);
            newsContainer.appendChild(articleCard);
        });

    } catch (error) {
        handleError(error, category);
    }
}

function createArticleCard(article) {
    const card = document.createElement('div');
    card.className = 'news-card';
    card.innerHTML = `
        <div class="news-image">
            <img src="${article.image || 'placeholder.jpg'}" 
                 alt="${article.title}" 
                 loading="lazy"
                 onerror="this.src='placeholder.jpg'">
        </div>
        <div class="news-content">
            <h3>${article.title}</h3>
            <p>${article.description}</p>
            <div class="article-meta">
                <span class="source">${article.source.name}</span>
                <span class="published-at">${new Date(article.publishedAt).toLocaleDateString()}</span>
            </div>
            <a href="${article.url}" target="_blank" class="read-more">Read More →</a>
        </div>
    `;
    return card;
}

function updateActiveCategory(category) {
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.category === category) {
            link.classList.add('active');
        }
    });
    
    // Update category title
    document.getElementById('category-title').textContent = `${categories[category]} News`;
}

function handleError(error, category) {
    console.error('Error fetching news:', error);
    newsContainer.innerHTML = `
        <div class="error-message">
            <h3>⚠️ ${categories[category]} news unavailable</h3>
            <p>Please try another category or check back later.</p>
        </div>
    `;
}

// Event Listeners
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        currentCategory = e.target.dataset.category;
        fetchGNews(currentCategory);
    });
});

document.querySelector('.menu-toggle').addEventListener('click', () => {
    document.querySelector('.nav-list').classList.toggle('active');
});

// Auto-refresh with current category
setInterval(() => fetchGNews(currentCategory), 180000);

// Initial load
fetchGNews();
