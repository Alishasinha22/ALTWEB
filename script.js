// ===== DOM Elements =====
const websitesContainer = document.getElementById('websites-container');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const categoryBtns = document.querySelectorAll('.category-btn');
const themeToggle = document.getElementById('theme-toggle');
const blossomToggle = document.getElementById('blossom-toggle');
const favoritesToggle = document.getElementById('favorites-toggle');
const totalCount = document.getElementById('total-count');
const showingCount = document.getElementById('showing-count');
const favoritesCount = document.getElementById('favorites-count');
const sakuraContainer = document.getElementById('sakura-container');
const themeLabel = document.querySelector('.theme-label');
const blossomCountElement = document.querySelector('.blossom-count');

// ===== State Variables =====
let allWebsites = [];
let filteredWebsites = [];
let currentCategory = 'all';
let currentSearch = '';
let showFavoritesOnly = false;
let favorites = JSON.parse(localStorage.getItem('altweb-favorites')) || [];
let isNightMode = localStorage.getItem('altweb-night-mode') === 'true';
let blossomsActive = true;
let blossomCount = 25;

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Load data
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            allWebsites = data.websites;
            totalCount.textContent = allWebsites.length;
            renderWebsites();
            updateFavoritesCount();
        })
        .catch(error => {
            console.error('Error loading data:', error);
            websitesContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error loading data</h3>
                    <p>Please check if data.json exists</p>
                </div>
            `;
        });
    
    // Initialize theme
    if (isNightMode) {
        document.body.classList.add('night-mode');
        document.body.classList.remove('day-mode');
        themeLabel.textContent = 'Night Mode';
    } else {
        themeLabel.textContent = 'Day Mode';
    }
    
    // Initialize blossoms
    createCherryBlossoms();
    
    // Initialize blossom count display
    blossomCountElement.textContent = blossomCount;
});

// ===== Sakura Blossom Functions =====
function createCherryBlossom() {
    const blossom = document.createElement('div');
    blossom.classList.add('sakura-blossom');
    
    // Random size
    const sizes = ['small', '', 'large'];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    if (size) blossom.classList.add(size);
    
    // Random color (some white blossoms)
    if (Math.random() > 0.7) {
        blossom.classList.add('white');
    }
    
    // Random position
    const left = Math.random() * 100;
    blossom.style.left = `${left}vw`;
    
    // Random animation duration and delay
    const duration = 15 + Math.random() * 25; // 15-40 seconds
    const delay = Math.random() * 5; // 0-5 seconds delay
    blossom.style.animationDuration = `${duration}s`;
    blossom.style.animationDelay = `${delay}s`;
    
    // Random rotation
    const rotation = Math.random() * 360;
    blossom.style.setProperty('--rotation', `${rotation}deg`);
    
    sakuraContainer.appendChild(blossom);
    
    // Remove blossom after animation completes
    setTimeout(() => {
        if (blossom.parentNode) {
            blossom.remove();
        }
    }, (duration + delay) * 1000);
}

function createCherryBlossoms() {
    if (!blossomsActive) return;
    
    // Clear existing blossoms
    sakuraContainer.innerHTML = '';
    
    // Create initial blossoms
    for (let i = 0; i < blossomCount; i++) {
        createCherryBlossom();
    }
    
    // Continuously create new blossoms
    setInterval(() => {
        if (blossomsActive && sakuraContainer.children.length < blossomCount) {
            createCherryBlossom();
        }
    }, 500);
}

function toggleBlossoms() {
    blossomsActive = !blossomsActive;
    const blossomBtn = blossomToggle.querySelector('i');
    
    if (blossomsActive) {
        createCherryBlossoms();
        blossomBtn.classList.remove('fa-wind');
        blossomBtn.classList.add('fa-wind');
        blossomToggle.classList.remove('disabled');
    } else {
        sakuraContainer.innerHTML = '';
        blossomBtn.classList.remove('fa-wind');
        blossomBtn.classList.add('fa-leaf');
        blossomToggle.classList.add('disabled');
    }
}

function adjustBlossomCount(change) {
    blossomCount = Math.max(10, Math.min(50, blossomCount + change));
    blossomCountElement.textContent = blossomCount;
    
    if (blossomsActive) {
        createCherryBlossoms();
    }
}

// ===== Theme Functions =====
function toggleTheme() {
    isNightMode = !isNightMode;
    
    if (isNightMode) {
        document.body.classList.add('night-mode');
        document.body.classList.remove('day-mode');
        themeLabel.textContent = 'Night Mode';
    } else {
        document.body.classList.remove('night-mode');
        document.body.classList.add('day-mode');
        themeLabel.textContent = 'Day Mode';
    }
    
    // Save preference
    localStorage.setItem('altweb-night-mode', isNightMode);
}

// ===== Website Rendering =====
function renderWebsites() {
    // Filter websites
    filteredWebsites = allWebsites.filter(website => {
        // Category filter
        if (currentCategory !== 'all' && website.category !== currentCategory) {
            return false;
        }
        
        // Search filter
        if (currentSearch) {
            const searchLower = currentSearch.toLowerCase();
            const inName = website.name.toLowerCase().includes(searchLower);
            const inDesc = website.description.toLowerCase().includes(searchLower);
            const inTags = website.tags.some(tag => tag.toLowerCase().includes(searchLower));
            const inCategory = website.categoryName.toLowerCase().includes(searchLower);
            
            if (!inName && !inDesc && !inTags && !inCategory) {
                return false;
            }
        }
        
        // Favorites filter
        if (showFavoritesOnly && !favorites.includes(website.id)) {
            return false;
        }
        
        return true;
    });
    
    // Update showing count
    showingCount.textContent = filteredWebsites.length;
    
    // Show/hide no results message
    const noResults = document.getElementById('no-results');
    if (filteredWebsites.length === 0) {
        noResults.style.display = 'block';
        websitesContainer.innerHTML = '';
    } else {
        noResults.style.display = 'none';
        
        // Generate HTML for websites
        const websitesHTML = filteredWebsites.map(website => createWebsiteCard(website)).join('');
        websitesContainer.innerHTML = websitesHTML;
        
        // Attach event listeners to favorite buttons
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const websiteId = parseInt(e.currentTarget.dataset.id);
                toggleFavorite(websiteId);
            });
        });
    }
}

function createWebsiteCard(website) {
    const isFavorite = favorites.includes(website.id);
    const favoriteClass = isFavorite ? 'active' : '';
    const cardClass = isFavorite ? 'website-card favorite' : 'website-card';
    
    // Truncate description if too long
    const maxDescLength = 150;
    let description = website.description;
    if (description.length > maxDescLength) {
        description = description.substring(0, maxDescLength) + '...';
    }
    
    // Create tags HTML
    const tagsHTML = website.tags.map(tag => 
        `<span class="tag">${tag}</span>`
    ).join('');
    
    return `
        <div class="${cardClass}">
            <div class="card-header">
                <div>
                    <h3 class="website-name">${website.icon} ${website.name}</h3>
                    <span class="category-badge">${website.categoryName}</span>
                </div>
                <button class="favorite-btn ${favoriteClass}" data-id="${website.id}" title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                    <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
            
            <p class="website-description">${description}</p>
            
            <div class="tags-container">
                ${tagsHTML}
            </div>
            
            <div class="card-footer">
                <a href="${website.url}" target="_blank" class="visit-btn" title="Visit ${website.name}">
                    <i class="fas fa-external-link-alt"></i> Visit Site
                </a>
                <span class="website-url" title="${website.url}">
                    ${new URL(website.url).hostname}
                </span>
            </div>
        </div>
    `;
}

// ===== Favorites Functions =====
function toggleFavorite(websiteId) {
    const index = favorites.indexOf(websiteId);
    
    if (index === -1) {
        // Add to favorites
        favorites.push(websiteId);
    } else {
        // Remove from favorites
        favorites.splice(index, 1);
    }
    
    // Save to localStorage
    localStorage.setItem('altweb-favorites', JSON.stringify(favorites));
    
    // Update UI
    updateFavoritesCount();
    renderWebsites();
}

function updateFavoritesCount() {
    favoritesCount.textContent = favorites.length;
}

// ===== Event Listeners =====
// Search input
searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value.trim();
    clearSearchBtn.style.opacity = currentSearch ? '1' : '0';
    renderWebsites();
});

// Clear search
clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    currentSearch = '';
    clearSearchBtn.style.opacity = '0';
    renderWebsites();
});

// Category filter buttons
categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active button
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update category
        currentCategory = btn.dataset.category;
        renderWebsites();
    });
});

// Theme toggle
themeToggle.addEventListener('click', toggleTheme);

// Blossom toggle
blossomToggle.addEventListener('click', toggleBlossoms);

// Blossom count controls (using wheel event)
sakuraContainer.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
        e.preventDefault();
        adjustBlossomCount(e.deltaY > 0 ? -1 : 1);
    }
});

// Favorites toggle
favoritesToggle.addEventListener('click', () => {
    showFavoritesOnly = !showFavoritesOnly;
    
    if (showFavoritesOnly) {
        favoritesToggle.classList.add('active');
        favoritesToggle.innerHTML = '<i class="fas fa-heart"></i> Show All';
    } else {
        favoritesToggle.classList.remove('active');
        favoritesToggle.innerHTML = '<i class="far fa-heart"></i> Show Favorites';
    }
    
    renderWebsites();
});

// ===== Keyboard Shortcuts =====
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + F to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInput.focus();
    }
    
    // Ctrl/Cmd + T to toggle theme
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        toggleTheme();
    }
    
    // Ctrl/Cmd + B to toggle blossoms
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleBlossoms();
    }
    
    // Escape to clear search
    if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = '';
        currentSearch = '';
        clearSearchBtn.style.opacity = '0';
        renderWebsites();
    }
});

// ===== Responsive Helpers =====
window.addEventListener('resize', () => {
    // Adjust blossom count based on screen size
    if (window.innerWidth < 768) {
        blossomCount = 15;
    } else {
        blossomCount = 25;
    }
    
    blossomCountElement.textContent = blossomCount;
    
    if (blossomsActive) {
        createCherryBlossoms();
    }
});
