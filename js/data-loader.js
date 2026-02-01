/**
 * Data Loader - Loads restaurant and review data from JSON files
 * This replaces the hardcoded data in restaurant-data.js
 */

// Global data stores
let restaurantsData = [];
let reviewsData = [];
let dataConfig = {};
let dataLoaded = false;

// Feature display configuration
const featureIcons = {
    highChairs: '👶',
    kidsMenu: '🍽️',
    changingTable: '🚼',
    playArea: '🎮',
    outdoorSeating: '🌳',
    patientStaff: '😊',
    crayons: '🖍️',
    birthdayParties: '🎂',
    privateRoom: '🚪',
    boosterSeats: '🪑'
};

const featureLabels = {
    highChairs: 'High Chairs',
    kidsMenu: 'Kids Menu',
    changingTable: 'Changing Table',
    playArea: 'Play Area',
    outdoorSeating: 'Outdoor Seating',
    patientStaff: 'Patient Staff',
    crayons: 'Crayons & Activities',
    birthdayParties: 'Birthday Parties',
    privateRoom: 'Private Room',
    boosterSeats: 'Booster Seats'
};

const categoryRatingLabels = {
    kidsMenu: 'Kid-Friendly Menu',
    staff: 'Staff Patience',
    cleanliness: 'Cleanliness',
    noiseTolerance: 'Noise Tolerance',
    entertainment: 'Entertainment',
    valueForMoney: 'Value for Money',
    waitTime: 'Wait Time',
    spaciousness: 'Spaciousness'
};

const categoryRatingIcons = {
    kidsMenu: '🍽️',
    staff: '😊',
    cleanliness: '✨',
    noiseTolerance: '🔊',
    entertainment: '🎮',
    valueForMoney: '💰',
    waitTime: '⏱️',
    spaciousness: '📏'
};

const categoryRatingDescriptions = {
    kidsMenu: 'Quality and variety of children\'s menu options',
    staff: 'How patient and accommodating staff are with families',
    cleanliness: 'Overall cleanliness including bathrooms and changing facilities',
    noiseTolerance: 'How welcoming they are to normal kid noise',
    entertainment: 'Play areas, activities, and entertainment for kids',
    valueForMoney: 'Price vs. quality for family dining',
    waitTime: 'How quickly food arrives at your table',
    spaciousness: 'Room for strollers, high chairs, and moving around'
};

/**
 * Load all data from JSON files
 */
async function loadData() {
    if (dataLoaded) return { restaurants: restaurantsData, reviews: reviewsData };

    try {
        // Load restaurants and reviews in parallel
        const [restaurantsResponse, reviewsResponse] = await Promise.all([
            fetch('/data/restaurants.json'),
            fetch('/data/reviews.json')
        ]);

        if (!restaurantsResponse.ok || !reviewsResponse.ok) {
            throw new Error('Failed to load data');
        }

        const restaurantsJson = await restaurantsResponse.json();
        const reviewsJson = await reviewsResponse.json();

        restaurantsData = restaurantsJson.restaurants || [];
        reviewsData = reviewsJson.reviews || [];
        dataConfig = {
            features: restaurantsJson.features || {},
            locations: restaurantsJson.locations || [],
            cuisines: restaurantsJson.cuisines || [],
            ageRanges: restaurantsJson.ageRanges || {}
        };

        dataLoaded = true;
        console.log(`Loaded ${restaurantsData.length} restaurants and ${reviewsData.length} reviews`);

        return { restaurants: restaurantsData, reviews: reviewsData, config: dataConfig };
    } catch (error) {
        console.error('Error loading data:', error);
        // Return empty data on error
        return { restaurants: [], reviews: [], config: {} };
    }
}

/**
 * Get all restaurants
 */
function getRestaurants() {
    return restaurantsData;
}

/**
 * Get featured restaurants
 */
function getFeaturedRestaurants(limit = 6) {
    return restaurantsData
        .filter(r => r.featured)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
}

/**
 * Get restaurant by slug
 */
function getRestaurantBySlug(slug) {
    return restaurantsData.find(r => r.slug === slug);
}

/**
 * Get restaurant by ID
 */
function getRestaurantById(id) {
    return restaurantsData.find(r => r.id === id);
}

/**
 * Get reviews for a restaurant
 */
function getReviewsForRestaurant(restaurantId) {
    return reviewsData.filter(r => r.restaurantId === restaurantId);
}

/**
 * Get recent reviews
 */
function getRecentReviews(limit = 5) {
    return [...reviewsData]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
}

/**
 * Filter restaurants by criteria
 */
function filterRestaurants(filters = {}) {
    let results = [...restaurantsData];

    if (filters.location) {
        results = results.filter(r => r.location === filters.location);
    }

    if (filters.cuisine) {
        results = results.filter(r => r.cuisine === filters.cuisine);
    }

    if (filters.priceRange) {
        results = results.filter(r => r.priceRange === filters.priceRange);
    }

    if (filters.features && filters.features.length > 0) {
        results = results.filter(r =>
            filters.features.every(f => r.features.includes(f))
        );
    }

    if (filters.ageRange && filters.ageRange.length > 0) {
        results = results.filter(r =>
            filters.ageRange.some(a => r.ageRange.includes(a))
        );
    }

    if (filters.minRating) {
        results = results.filter(r => r.rating >= filters.minRating);
    }

    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        results = results.filter(r =>
            r.name.toLowerCase().includes(searchLower) ||
            r.description.toLowerCase().includes(searchLower) ||
            r.cuisine.toLowerCase().includes(searchLower) ||
            r.neighborhood.toLowerCase().includes(searchLower)
        );
    }

    // Sort results
    if (filters.sort) {
        switch (filters.sort) {
            case 'rating':
                results.sort((a, b) => b.rating - a.rating);
                break;
            case 'reviewCount':
                results.sort((a, b) => b.reviewCount - a.reviewCount);
                break;
            case 'name':
                results.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'priceAsc':
                results.sort((a, b) => a.priceRange.length - b.priceRange.length);
                break;
            case 'priceDesc':
                results.sort((a, b) => b.priceRange.length - a.priceRange.length);
                break;
        }
    } else {
        // Default sort by rating
        results.sort((a, b) => b.rating - a.rating);
    }

    return results;
}

/**
 * Get unique locations from data
 */
function getLocations() {
    const locations = [...new Set(restaurantsData.map(r => r.location))];
    return locations.sort();
}

/**
 * Get unique cuisines from data
 */
function getCuisines() {
    const cuisines = [...new Set(restaurantsData.map(r => r.cuisine))];
    return cuisines.sort();
}

/**
 * Get statistics
 */
function getStats() {
    const totalRestaurants = restaurantsData.length;
    const totalReviews = reviewsData.length;
    const totalReviewCount = restaurantsData.reduce((sum, r) => sum + r.reviewCount, 0);
    const uniqueLocations = new Set(restaurantsData.map(r => r.location)).size;
    const avgRating = restaurantsData.reduce((sum, r) => sum + r.rating, 0) / totalRestaurants;

    return {
        restaurants: totalRestaurants,
        reviews: totalReviews,
        totalReviewCount,
        locations: uniqueLocations,
        averageRating: avgRating.toFixed(1),
        happyFamilies: Math.floor(totalReviewCount * 2.5)
    };
}

/**
 * Get restaurants with play areas
 */
function getRestaurantsWithPlayArea() {
    return restaurantsData.filter(r => r.features.includes('playArea'));
}

/**
 * Get restaurants with outdoor seating
 */
function getRestaurantsWithOutdoorSeating() {
    return restaurantsData.filter(r => r.features.includes('outdoorSeating'));
}

/**
 * Get restaurants good for birthday parties
 */
function getRestaurantsForBirthdays() {
    return restaurantsData.filter(r =>
        r.features.includes('birthdayParties') ||
        r.features.includes('playArea') ||
        r.features.includes('outdoorSeating')
    );
}

/**
 * Get quick bite restaurants ($ or $$ and fast service)
 */
function getQuickBiteRestaurants() {
    return restaurantsData.filter(r =>
        (r.priceRange === '$' || r.priceRange === '$$') &&
        r.categoryRatings.waitTime >= 4.3
    );
}

// Export functions for use in other files
window.DataLoader = {
    loadData,
    getRestaurants,
    getFeaturedRestaurants,
    getRestaurantBySlug,
    getRestaurantById,
    getReviewsForRestaurant,
    getRecentReviews,
    filterRestaurants,
    getLocations,
    getCuisines,
    getStats,
    getRestaurantsWithPlayArea,
    getRestaurantsWithOutdoorSeating,
    getRestaurantsForBirthdays,
    getQuickBiteRestaurants,
    featureIcons,
    featureLabels,
    categoryRatingLabels,
    categoryRatingIcons,
    categoryRatingDescriptions
};
