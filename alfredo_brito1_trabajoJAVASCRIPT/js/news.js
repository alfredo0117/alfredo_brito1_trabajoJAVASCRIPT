// JavaScript para cargar y mostrar noticias

document.addEventListener('DOMContentLoaded', function() {
    loadNews();
});

async function loadNews() {
    const newsContainer = document.getElementById('news-container');
    
    if (!newsContainer) return;

    try {
        // Mostrar loading
        Utils.showLoading(newsContainer);
        
        // Simular delay para mostrar el loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Cargar noticias desde JSON
        const response = await fetch('data/news.json');
        
        if (!response.ok) {
            throw new Error('Error al cargar las noticias');
        }
        
        const newsData = await response.json();
        
        // Mostrar solo las primeras 6 noticias
        const latestNews = newsData.slice(0, 6);
        
        displayNews(latestNews);
        
    } catch (error) {
        console.error('Error cargando noticias:', error);
        Utils.showError(newsContainer, 'Error al cargar las noticias. Por favor, inténtalo más tarde.');
    }
}

function displayNews(newsArray) {
    const newsContainer = document.getElementById('news-container');
    
    if (!newsArray || newsArray.length === 0) {
        newsContainer.innerHTML = '<p>No hay noticias disponibles.</p>';
        return;
    }
    
    const newsHTML = newsArray.map(news => createNewsCard(news)).join('');
    newsContainer.innerHTML = newsHTML;
    
    // Aplicar animaciones
    const newsCards = newsContainer.querySelectorAll('.news-card');
    newsCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
        
        // Observar para animación al scroll
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(card);
    });
}

function createNewsCard(news) {
    return `
        <article class="news-card">
            <div class="news-image">
                <i class="fas ${getIconForCategory(news.category)}"></i>
            </div>
            <div class="news-content">
                <div class="news-meta">
                    <span><i class="fas fa-calendar"></i> ${Utils.formatDate(news.date)}</span>
                    <span><i class="fas fa-tag"></i> ${news.category}</span>
                    <span><i class="fas fa-user"></i> ${news.author}</span>
                </div>
                <h3 class="news-title">${news.title}</h3>
                <p class="news-excerpt">${news.excerpt}</p>
                <a href="#" class="read-more" onclick="showNewsDetail('${news.id}')">
                    Leer más <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </article>
    `;
}

function getIconForCategory(category) {
    const icons = {
        'Tecnología': 'fa-laptop-code',
        'Seguridad': 'fa-shield-alt',
        'Cloud': 'fa-cloud',
        'Móvil': 'fa-mobile-alt',
        'Automatización': 'fa-robot',
        'Blockchain': 'fa-link',
        'default': 'fa-newspaper'
    };
    
    return icons[category] || icons.default;
}

function showNewsDetail(newsId) {
    // Esta función se puede expandir para mostrar detalles completos de la noticia
    console.log('Mostrando detalles de la noticia:', newsId);
    
    // Por ahora, mostrar un alert simple
    alert(`Funcionalidad de detalle de noticia en desarrollo.\nID de noticia: ${newsId}`);
    
    // En una implementación real, podrías:
    // 1. Abrir un modal con los detalles completos
    // 2. Navegar a una página de detalle
    // 3. Expandir la tarjeta con más información
}

// Función para filtrar noticias por categoría (para uso futuro)
function filterNewsByCategory(category) {
    fetch('data/news.json')
        .then(response => response.json())
        .then(data => {
            const filteredNews = category === 'all' 
                ? data 
                : data.filter(news => news.category === category);
            displayNews(filteredNews.slice(0, 6));
        })
        .catch(error => {
            console.error('Error filtering news:', error);
        });
}

// Función para buscar noticias (para uso futuro)
function searchNews(query) {
    if (!query.trim()) {
        loadNews();
        return;
    }
    
    fetch('data/news.json')
        .then(response => response.json())
        .then(data => {
            const searchResults = data.filter(news => 
                news.title.toLowerCase().includes(query.toLowerCase()) ||
                news.excerpt.toLowerCase().includes(query.toLowerCase()) ||
                news.category.toLowerCase().includes(query.toLowerCase())
            );
            displayNews(searchResults);
        })
        .catch(error => {
            console.error('Error searching news:', error);
        });
}

console.log('News.js cargado correctamente');
