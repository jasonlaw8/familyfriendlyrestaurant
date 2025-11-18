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
function initializeSearch() {
    // Add event listeners for filter changes
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
    // Get current filter values
    currentFilters.location = document.getElementById('filter-location')?.value || '';
    currentFilters.cuisine = document.getElementById('filter-cuisine')?.value || '';
    currentFilters.features = document.getElementById('filter-features')?.value || '';
    currentFilters.ageRange = document.getElementById('filter-age')?.value || '';

    // Filter restaurants
    const filteredRestaurants = filterRestaurants(restaurantsData, currentFilters);

    // Update display
    const gridElement = document.getElementById('restaurantGrid') || document.getElementById('featuredGrid');
    if (gridElement) {
        renderRestaurants(filteredRestaurants, gridElement);
    }

    // Update URL parameters (for search page)
    updateURLParams(currentFilters);
}

// Filter restaurants based on criteria
function filterRestaurants(restaurants, filters) {
    return restaurants.filter(restaurant => {
        // Location filter
        if (filters.location && restaurant.location.toLowerCase() !== filters.location.toLowerCase()) {
            return false;
        }

        // Cuisine filter
        if (filters.cuisine && restaurant.cuisine.toLowerCase() !== filters.cuisine.toLowerCase()) {
            return false;
        }

        // Features filter
        if (filters.features) {
            const featureMap = {
                'highchairs': 'highChairs',
                'kids-menu': 'kidsMenu',
                'play-area': 'playArea',
                'changing-table': 'changingTable',
                'outdoor': 'outdoorSeating'
            };
            const featureKey = featureMap[filters.features];
            if (featureKey && !restaurant.features[featureKey]) {
                return false;
            }
        }

        // Age range filter
        if (filters.ageRange && !restaurant.ageRange.includes(filters.ageRange)) {
            return false;
        }

        // Search term filter (searches in name, description, location)
        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            const searchableText = `${restaurant.name} ${restaurant.description} ${restaurant.location} ${restaurant.neighborhood}`.toLowerCase();
            if (!searchableText.includes(term)) {
                return false;
            }
        }

        return true;
    });
}

// Clear all filters
function clearFilters() {
    document.getElementById('filter-location').value = '';
    document.getElementById('filter-cuisine').value = '';
    document.getElementById('filter-features').value = '';
    document.getElementById('filter-age').value = '';

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

    // Build search URL
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (occasion) params.append('occasion', occasion);

    // Redirect to search page
    window.location.href = `/search.html?${params.toString()}`;
}

// Update URL parameters without page reload
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
        searchTerm: params.get('search') || '',
        occasion: params.get('occasion') || ''
    };
}

// Apply filters from URL on page load
function applyURLFilters() {
    const urlFilters = getFiltersFromURL();

    // Set filter values from URL
    if (urlFilters.location && document.getElementById('filter-location')) {
        document.getElementById('filter-location').value = urlFilters.location;
    }
    if (urlFilters.cuisine && document.getElementById('filter-cuisine')) {
        document.getElementById('filter-cuisine').value = urlFilters.cuisine;
    }
    if (urlFilters.features && document.getElementById('filter-features')) {
        document.getElementById('filter-features').value = urlFilters.features;
    }
    if (urlFilters.ageRange && document.getElementById('filter-age')) {
        document.getElementById('filter-age').value = urlFilters.ageRange;
    }

    currentFilters = urlFilters;
    applyFilters();
}

// Render restaurants to the grid
function renderRestaurants(restaurants, gridElement) {
    if (!gridElement) return;

    if (restaurants.length === 0) {
        gridElement.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state-icon">🔍</div>
                <h3>No restaurants found</h3>
                <p>Try adjusting your filters or search criteria</p>
                <button class="btn btn-primary" onclick="clearFilters()">Clear Filters</button>
            </div>
        `;
        return;
    }

    gridElement.innerHTML = restaurants.map(restaurant => createRestaurantCard(restaurant)).join('');
}

// Create restaurant card HTML
function createRestaurantCard(restaurant) {
    const features = Object.keys(restaurant.features)
        .filter(key => restaurant.features[key] && featureIcons[key])
        .slice(0, 4)
        .map(key => `
            <span class="feature-tag">
                <span class="feature-icon">${featureIcons[key]}</span>
                ${featureLabels[key]}
            </span>
        `).join('');

    const stars = '⭐'.repeat(Math.floor(restaurant.rating));
    const badge = restaurant.premium ? '<span class="card-badge premium">Premium</span>' :
                  restaurant.featured ? '<span class="card-badge featured">Featured</span>' : '';

    // Use gradient background if no image
    const imageStyle = restaurant.images[0] ?
        `background-image: url('${restaurant.images[0]}')` :
        `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)`;

    return `
        <div class="restaurant-card" onclick="window.location.href='/restaurants/${restaurant.slug}.html'">
            <div class="card-image" style="${imageStyle}">
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
                    ${features}
                </div>

                <p class="card-description">${restaurant.description}</p>

                <div class="card-footer">
                    <span class="price-range">${restaurant.priceRange}</span>
                    <span class="card-cta">View Details</span>
                </div>
            </div>
        </div>
    `;
}

// Search functionality for search page
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
            // Featured first
            sorted.sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return b.rating - a.rating;
            });
    }

    return sorted;
}
