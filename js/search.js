// Search and Filter Functionality

// Global filter state
let currentFilters = {
    location: '',
    cuisine: '',
    features: '',
    ageRange: '',
    searchTerm: '',
    occasion: ''
};

// Initialize search and filter functionality
function initializeSearchFilters() {
    const filterLocation = document.getElementById('filter-location');
    const filterCuisine = document.getElementById('filter-cuisine');
    const filterFeatures = document.getElementById('filter-features');
    const filterAge = document.getElementById('filter-age');

    if (filterLocation) filterLocation.addEventListener('change', applyFilters);
    if (filterCuisine) filterCuisine.addEventListener('change', applyFilters);
    if (filterFeatures) filterFeatures.addEventListener('change', applyFilters);
    if (filterAge) filterAge.addEventListener('change', applyFilters);
}

// Apply filters to restaurant list
function applyFilters() {
    currentFilters.location = document.getElementById('filter-location')?.value || '';
    currentFilters.cuisine = document.getElementById('filter-cuisine')?.value || '';
    currentFilters.features = document.getElementById('filter-features')?.value || '';
    currentFilters.ageRange = document.getElementById('filter-age')?.value || '';

    // Get all restaurants from DataLoader
    const allRestaurants = DataLoader.getRestaurants();

    // Apply filters
    const filteredRestaurants = filterRestaurantsLocal(allRestaurants, currentFilters);

    // Update display
    const gridElement = document.getElementById('restaurantGrid') || document.getElementById('featuredGrid');
    if (gridElement) {
        renderSearchRestaurants(filteredRestaurants, gridElement);
        updateResultsCount(filteredRestaurants.length);
    }

    // Update URL parameters
    updateURLParams(currentFilters);
}

// Filter restaurants based on criteria
function filterRestaurantsLocal(restaurants, filters) {
    return restaurants.filter(restaurant => {
        // Location filter
        if (filters.location && restaurant.location.toLowerCase() !== filters.location.toLowerCase()) {
            return false;
        }

        // Cuisine filter
        if (filters.cuisine && restaurant.cuisine.toLowerCase() !== filters.cuisine.toLowerCase()) {
            return false;
        }

        // Features filter (now features is an array)
        if (filters.features) {
            const featureMap = {
                'highchairs': 'highChairs',
                'kids-menu': 'kidsMenu',
                'play-area': 'playArea',
                'changing-table': 'changingTable',
                'outdoor': 'outdoorSeating'
            };
            const featureKey = featureMap[filters.features] || filters.features;
            if (!restaurant.features.includes(featureKey)) {
                return false;
            }
        }

        // Age range filter
        if (filters.ageRange && !restaurant.ageRange.includes(filters.ageRange)) {
            return false;
        }

        // Search term filter
        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            const searchableText = `${restaurant.name} ${restaurant.description} ${restaurant.location} ${restaurant.neighborhood} ${restaurant.cuisine}`.toLowerCase();
            if (!searchableText.includes(term)) {
                return false;
            }
        }

        // Occasion filter
        if (filters.occasion) {
            switch (filters.occasion) {
                case 'birthday':
                    if (!restaurant.features.includes('birthdayParties') && !restaurant.features.includes('playArea')) {
                        return false;
                    }
                    break;
                case 'outdoor':
                    if (!restaurant.features.includes('outdoorSeating')) {
                        return false;
                    }
                    break;
                case 'quick':
                    if (restaurant.priceRange.length > 2 || restaurant.categoryRatings?.waitTime < 4.3) {
                        return false;
                    }
                    break;
            }
        }

        return true;
    });
}

// Clear all filters
function clearFilters() {
    const locationEl = document.getElementById('filter-location');
    const cuisineEl = document.getElementById('filter-cuisine');
    const featuresEl = document.getElementById('filter-features');
    const ageEl = document.getElementById('filter-age');

    if (locationEl) locationEl.value = '';
    if (cuisineEl) cuisineEl.value = '';
    if (featuresEl) featuresEl.value = '';
    if (ageEl) ageEl.value = '';

    currentFilters = {
        location: '',
        cuisine: '',
        features: '',
        ageRange: '',
        searchTerm: '',
        occasion: ''
    };

    applyFilters();
}

// Perform search from hero section
function performSearch() {
    const location = document.getElementById('hero-location')?.value || '';
    const occasion = document.getElementById('hero-occasion')?.value || '';

    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (occasion) params.append('occasion', occasion);

    window.location.href = `/search.html?${params.toString()}`;
}

// Update URL parameters
function updateURLParams(filters) {
    if (!window.history.replaceState) return;

    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
        if (filters[key]) {
            params.append(key, filters[key]);
        }
    });

    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newURL);
}

// Get filters from URL parameters
function getFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);
    return {
        location: params.get('location') || '',
        cuisine: params.get('cuisine') || '',
        features: params.get('features') || '',
        ageRange: params.get('ageRange') || '',
        searchTerm: params.get('q') || params.get('search') || '',
        occasion: params.get('occasion') || ''
    };
}

// Apply filters from URL on page load
function applyURLFilters() {
    const urlFilters = getFiltersFromURL();

    // Set filter values from URL
    const locationEl = document.getElementById('filter-location');
    const cuisineEl = document.getElementById('filter-cuisine');
    const featuresEl = document.getElementById('filter-features');
    const ageEl = document.getElementById('filter-age');
    const searchEl = document.getElementById('search-input');

    if (urlFilters.location && locationEl) {
        // Try to match location value
        const options = Array.from(locationEl.options);
        const match = options.find(opt =>
            opt.value.toLowerCase() === urlFilters.location.toLowerCase() ||
            opt.textContent.toLowerCase() === urlFilters.location.toLowerCase()
        );
        if (match) locationEl.value = match.value;
    }
    if (urlFilters.cuisine && cuisineEl) cuisineEl.value = urlFilters.cuisine;
    if (urlFilters.features && featuresEl) featuresEl.value = urlFilters.features;
    if (urlFilters.ageRange && ageEl) ageEl.value = urlFilters.ageRange;
    if (urlFilters.searchTerm && searchEl) searchEl.value = urlFilters.searchTerm;

    currentFilters = urlFilters;
}

// Render restaurants to the grid
function renderSearchRestaurants(restaurants, gridElement) {
    if (!gridElement) return;

    if (restaurants.length === 0) {
        gridElement.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <div class="empty-state-icon" style="font-size: 4rem;">🔍</div>
                <h3>No restaurants found</h3>
                <p style="color: #666; margin: 1rem 0;">Try adjusting your filters or search criteria</p>
                <button class="btn btn-primary" onclick="clearFilters()">Clear Filters</button>
            </div>
        `;
        return;
    }

    gridElement.innerHTML = restaurants.map(restaurant => createSearchRestaurantCard(restaurant)).join('');
}

// Create restaurant card HTML for search page
function createSearchRestaurantCard(restaurant) {
    const featuresHTML = restaurant.features.slice(0, 4).map(f => {
        const icon = DataLoader.featureIcons[f] || '✓';
        const label = DataLoader.featureLabels[f] || f;
        return `
            <span class="feature-tag">
                <span class="feature-icon">${icon}</span>
                ${label}
            </span>
        `;
    }).join('');

    const stars = '⭐'.repeat(Math.floor(restaurant.rating));
    const badge = restaurant.premium ? '<span class="card-badge premium">Premium</span>' :
                  restaurant.featured ? '<span class="card-badge featured">Featured</span>' : '';

    return `
        <div class="restaurant-card" onclick="window.location.href='/restaurants/${restaurant.slug}.html'">
            <div class="card-image" style="background-image: url('${restaurant.image}'); background-size: cover; background-position: center;">
                ${badge}
            </div>
            <div class="card-content">
                <div class="card-header">
                    <h3 class="card-title">${restaurant.name}</h3>
                    <div class="card-location">
                        <span>📍</span>
                        <span>${restaurant.neighborhood}, ${restaurant.location}</span>
                    </div>
                    <div class="card-cuisine">${restaurant.cuisine}</div>
                </div>

                <div class="card-rating">
                    <span class="stars">${stars}</span>
                    <span class="rating-text">${restaurant.rating}</span>
                    <span class="rating-count">(${restaurant.reviewCount} reviews)</span>
                </div>

                <div class="card-features">
                    ${featuresHTML}
                </div>

                <p class="card-description">${restaurant.description}</p>

                <div class="card-footer">
                    <span class="price-range">${restaurant.priceRange}</span>
                    <span class="card-cta">View Details →</span>
                </div>
            </div>
        </div>
    `;
}

// Search on page
function performSearchOnPage() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        currentFilters.searchTerm = searchInput.value;
        applyFilters();
    }
}

// Sort restaurants
function sortRestaurants(restaurants, sortBy) {
    const sorted = [...restaurants];

    switch (sortBy) {
        case 'rating':
            sorted.sort((a, b) => b.rating - a.rating);
            break;
        case 'reviews':
            sorted.sort((a, b) => b.reviewCount - a.reviewCount);
            break;
        case 'name':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'price-low':
            sorted.sort((a, b) => a.priceRange.length - b.priceRange.length);
            break;
        case 'price-high':
            sorted.sort((a, b) => b.priceRange.length - a.priceRange.length);
            break;
        default:
            sorted.sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return b.rating - a.rating;
            });
    }

    return sorted;
}

// Handle sort change
function handleSort() {
    const sortBy = document.getElementById('filter-sort')?.value || 'featured';
    const allRestaurants = DataLoader.getRestaurants();
    const filteredRestaurants = filterRestaurantsLocal(allRestaurants, currentFilters);
    const sortedRestaurants = sortRestaurants(filteredRestaurants, sortBy);

    const gridElement = document.getElementById('restaurantGrid');
    if (gridElement) {
        renderSearchRestaurants(sortedRestaurants, gridElement);
        updateResultsCount(sortedRestaurants.length);
    }
}

// Debounced search
const debounceSearch = (function() {
    let timeout;
    return function() {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            performSearchOnPage();
        }, 300);
    };
})();

// Update results count
function updateResultsCount(count) {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = `${count} ${count === 1 ? 'restaurant' : 'restaurants'} found`;
    }
}

// Toggle view
let currentView = 'grid';
function toggleView(view) {
    currentView = view;
    const grid = document.getElementById('restaurantGrid');
    const gridBtn = document.getElementById('gridViewBtn');
    const listBtn = document.getElementById('listViewBtn');

    if (grid) {
        if (view === 'list') {
            grid.classList.add('restaurant-list');
            grid.classList.remove('restaurant-grid');
        } else {
            grid.classList.add('restaurant-grid');
            grid.classList.remove('restaurant-list');
        }
    }
}

// Load more restaurants
let displayedCount = 12;
function loadMore() {
    const allRestaurants = DataLoader.getRestaurants();
    const filteredRestaurants = filterRestaurantsLocal(allRestaurants, currentFilters);
    const sortBy = document.getElementById('filter-sort')?.value || 'featured';
    const sortedRestaurants = sortRestaurants(filteredRestaurants, sortBy);

    displayedCount += 12;
    const toDisplay = sortedRestaurants.slice(0, displayedCount);

    const gridElement = document.getElementById('restaurantGrid');
    if (gridElement) {
        renderSearchRestaurants(toDisplay, gridElement);
    }

    if (displayedCount >= sortedRestaurants.length) {
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        if (loadMoreContainer) {
            loadMoreContainer.style.display = 'none';
        }
    }
}

// Populate filter dropdowns dynamically
function populateFilters() {
    const locations = DataLoader.getLocations();
    const cuisines = DataLoader.getCuisines();

    const locationEl = document.getElementById('filter-location');
    const cuisineEl = document.getElementById('filter-cuisine');

    if (locationEl && locations.length > 0) {
        const currentValue = locationEl.value;
        locationEl.innerHTML = '<option value="">All Areas</option>' +
            locations.map(loc => `<option value="${loc.toLowerCase()}">${loc}</option>`).join('');
        if (currentValue) locationEl.value = currentValue;
    }

    if (cuisineEl && cuisines.length > 0) {
        const currentValue = cuisineEl.value;
        cuisineEl.innerHTML = '<option value="">All Cuisines</option>' +
            cuisines.map(c => `<option value="${c.toLowerCase()}">${c}</option>`).join('');
        if (currentValue) cuisineEl.value = currentValue;
    }
}

// Initialize search page
async function initializeSearchPage() {
    const gridElement = document.getElementById('restaurantGrid');

    // Show loading state
    if (gridElement) {
        gridElement.innerHTML = `
            <div class="loading-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <div class="loading-spinner" style="margin: 0 auto 1rem; width: 50px; height: 50px; border: 4px solid #eee; border-top-color: #e85d04; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="color: #666;">Loading restaurants...</p>
            </div>
        `;
    }

    // Load data
    await DataLoader.loadData();

    // Populate filter dropdowns
    populateFilters();

    // Initialize filter listeners
    initializeSearchFilters();

    // Load URL filters if present
    applyURLFilters();

    // Get filtered and sorted restaurants
    const allRestaurants = DataLoader.getRestaurants();
    const filteredRestaurants = filterRestaurantsLocal(allRestaurants, currentFilters);
    const sortBy = document.getElementById('filter-sort')?.value || 'featured';
    const sortedRestaurants = sortRestaurants(filteredRestaurants, sortBy);

    // Display restaurants
    const toDisplay = sortedRestaurants.slice(0, displayedCount);
    if (gridElement) {
        renderSearchRestaurants(toDisplay, gridElement);
        updateResultsCount(sortedRestaurants.length);
    }

    // Hide load more if not needed
    if (sortedRestaurants.length <= displayedCount) {
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        if (loadMoreContainer) {
            loadMoreContainer.style.display = 'none';
        }
    }
}

// Initialize on search page load
if (window.location.pathname.includes('search.html')) {
    document.addEventListener('DOMContentLoaded', initializeSearchPage);
}

// Add spinner animation if not exists
if (!document.getElementById('search-spinner-keyframes')) {
    const style = document.createElement('style');
    style.id = 'search-spinner-keyframes';
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}
