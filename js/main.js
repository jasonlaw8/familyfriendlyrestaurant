// Main JavaScript for Bay Area Family Eats

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', async function() {
    // Load data from JSON files first
    await DataLoader.loadData();

    initializeMobileMenu();
    initializeStickyFilterBar();
    loadFeaturedRestaurants();
    loadRecentReviews();
    loadHomepageStats();
    initializeSearch();
    initializeNewsletterForm();
    initializeContactForm();
});

// Mobile Menu Toggle
function initializeMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            this.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.nav-content')) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });
    }
}

// Sticky Filter Bar
function initializeStickyFilterBar() {
    const filterBar = document.getElementById('filterBar');
    if (!filterBar) return;

    const navbar = document.querySelector('.navbar');
    const navbarHeight = navbar ? navbar.offsetHeight : 0;

    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            filterBar.style.top = navbarHeight + 'px';
        }
    });
}

// Load Featured Restaurants on Homepage
function loadFeaturedRestaurants() {
    const featuredGrid = document.getElementById('featuredGrid');
    if (!featuredGrid) return;

    const featured = DataLoader.getFeaturedRestaurants(6);

    if (featured.length === 0) {
        featuredGrid.innerHTML = '<p class="no-results">Loading restaurants...</p>';
        return;
    }

    renderRestaurants(featured, featuredGrid);
}

// Render restaurants to a grid
function renderRestaurants(restaurants, container) {
    container.innerHTML = restaurants.map(restaurant => createRestaurantCard(restaurant)).join('');
}

// Create Restaurant Card HTML
function createRestaurantCard(restaurant) {
    const stars = '⭐'.repeat(Math.round(restaurant.rating));
    const featuresHTML = restaurant.features.slice(0, 4).map(f => {
        const icon = DataLoader.featureIcons[f] || '✓';
        const label = DataLoader.featureLabels[f] || f;
        return `<span class="feature-tag" title="${label}">${icon}</span>`;
    }).join('');

    const priceClass = restaurant.priceRange.length <= 2 ? 'price-low' : 'price-high';

    return `
        <article class="restaurant-card" onclick="window.location.href='/restaurants/${restaurant.slug}.html'">
            <div class="restaurant-image">
                <img src="${restaurant.image}" alt="${restaurant.name}"
                     onerror="this.src='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop'"
                     loading="lazy">
                ${restaurant.premium ? '<span class="premium-badge">Premium</span>' : ''}
                <span class="price-badge ${priceClass}">${restaurant.priceRange}</span>
            </div>
            <div class="restaurant-content">
                <div class="restaurant-header">
                    <h3>${restaurant.name}</h3>
                    <div class="restaurant-rating">
                        <span class="rating-stars">${stars}</span>
                        <span class="rating-value">${restaurant.rating}</span>
                        <span class="review-count">(${restaurant.reviewCount})</span>
                    </div>
                </div>
                <div class="restaurant-meta">
                    <span class="cuisine">${restaurant.cuisine}</span>
                    <span class="separator">•</span>
                    <span class="location">${restaurant.neighborhood}, ${restaurant.location}</span>
                </div>
                <p class="restaurant-description">${restaurant.description}</p>
                <div class="restaurant-features">
                    ${featuresHTML}
                </div>
            </div>
        </article>
    `;
}

// Load Recent Reviews on Homepage
function loadRecentReviews() {
    const reviewsGrid = document.getElementById('reviewsGrid');
    if (!reviewsGrid) return;

    const reviews = DataLoader.getRecentReviews(3);

    if (reviews.length === 0) {
        reviewsGrid.innerHTML = '<p class="no-results">No reviews yet.</p>';
        return;
    }

    reviewsGrid.innerHTML = reviews.map(review => createReviewCard(review)).join('');
}

// Create Review Card HTML
function createReviewCard(review) {
    const stars = '⭐'.repeat(review.rating);
    const date = new Date(review.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    // Get restaurant name
    const restaurant = DataLoader.getRestaurantById(review.restaurantId);
    const restaurantName = restaurant ? restaurant.name : review.restaurantSlug;

    return `
        <div class="review-card">
            <div class="review-header">
                <div class="review-avatar">${review.userInitials}</div>
                <div class="review-info">
                    <h4>${review.userName}</h4>
                    <div class="review-meta">
                        <a href="/restaurants/${review.restaurantSlug}.html" class="review-restaurant">${restaurantName}</a>
                        <span>•</span>
                        <span>${date}</span>
                    </div>
                </div>
            </div>
            <div class="review-rating">${stars}</div>
            <p class="review-text">${review.text}</p>
            ${review.highlight ? `
                <div class="review-highlight">
                    <div class="review-highlight-title">Pro Tip</div>
                    <p>${review.highlight}</p>
                </div>
            ` : ''}
        </div>
    `;
}

// Load Homepage Stats
function loadHomepageStats() {
    const stats = DataLoader.getStats();

    // Update stat counters if they exist
    const restaurantCount = document.getElementById('restaurantCount');
    const locationCount = document.getElementById('locationCount');
    const reviewCount = document.getElementById('reviewCount');
    const familyCount = document.getElementById('familyCount');

    if (restaurantCount) restaurantCount.textContent = stats.restaurants + '+';
    if (locationCount) locationCount.textContent = stats.locations;
    if (reviewCount) reviewCount.textContent = stats.totalReviewCount.toLocaleString() + '+';
    if (familyCount) familyCount.textContent = stats.happyFamilies.toLocaleString() + '+';
}

// Initialize Newsletter Form
function initializeNewsletterForm() {
    const forms = document.querySelectorAll('.newsletter-form');
    forms.forEach(form => {
        form.addEventListener('submit', handleNewsletterSubmit);
    });
}

// Handle Newsletter Submission
async function handleNewsletterSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const emailInput = form.querySelector('input[type="email"]');
    const submitBtn = form.querySelector('button[type="submit"]');
    const email = emailInput.value.trim();

    if (!email) {
        showAlert('error', 'Please enter your email address.');
        return;
    }

    // Disable button during submission
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Subscribing...';
    submitBtn.disabled = true;

    // Store in localStorage as a simple "database"
    try {
        const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');

        if (subscribers.includes(email)) {
            showAlert('info', 'You\'re already subscribed! Check your inbox for our latest updates.');
        } else {
            subscribers.push(email);
            localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));
            showAlert('success', 'Thanks for subscribing! You\'ll receive our family-friendly restaurant updates.');
            form.reset();
        }
    } catch (error) {
        showAlert('success', 'Thanks for subscribing! You\'ll receive our family-friendly restaurant updates.');
        form.reset();
    }

    // Re-enable button
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
}

// Initialize Contact Form
function initializeContactForm() {
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', handleContactSubmit);
    }
}

// Handle Contact Form Submission
async function handleContactSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');

    // Basic validation
    const name = formData.get('name')?.trim();
    const email = formData.get('email')?.trim();
    const message = formData.get('message')?.trim();

    if (!name || !email || !message) {
        showAlert('error', 'Please fill in all required fields.');
        return;
    }

    // Disable button during submission
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Store in localStorage as a simple "database"
    try {
        const submissions = JSON.parse(localStorage.getItem('contact_submissions') || '[]');
        submissions.push({
            name,
            email,
            subject: formData.get('subject') || '',
            message,
            date: new Date().toISOString()
        });
        localStorage.setItem('contact_submissions', JSON.stringify(submissions));

        showAlert('success', 'Thanks for your message! We\'ll get back to you soon.');
        form.reset();
    } catch (error) {
        showAlert('success', 'Thanks for your message! We\'ll get back to you soon.');
        form.reset();
    }

    // Re-enable button
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
}

// Show Alert Message
function showAlert(type, message) {
    // Remove existing alerts
    document.querySelectorAll('.site-alert').forEach(a => a.remove());

    // Create alert element
    const alert = document.createElement('div');
    alert.className = `site-alert site-alert-${type}`;

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
    };

    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };

    alert.innerHTML = `
        <span class="alert-icon">${icons[type] || icons.info}</span>
        <span class="alert-message">${message}</span>
        <button class="alert-close" onclick="this.parentElement.remove()">×</button>
    `;

    // Style the alert
    alert.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: ${colors[type] || colors.info};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideDown 0.3s ease;
        max-width: 90%;
    `;

    // Add animation keyframes
    if (!document.getElementById('alert-keyframes')) {
        const style = document.createElement('style');
        style.id = 'alert-keyframes';
        style.textContent = `
            @keyframes slideDown {
                from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(alert);

    // Auto remove after 5 seconds
    setTimeout(() => {
        alert.style.opacity = '0';
        alert.style.transition = 'opacity 0.3s ease';
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}

// Initialize search on homepage
function initializeSearch() {
    const heroSearchForm = document.getElementById('heroSearchForm');
    if (heroSearchForm) {
        heroSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = this.querySelector('input[type="search"], input[type="text"]');
            const query = searchInput?.value.trim();
            if (query) {
                window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
            } else {
                window.location.href = '/search.html';
            }
        });
    }
}

// Smooth scroll to sections
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offset = 100;
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Lazy load images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Track analytics events (placeholder)
function trackEvent(category, action, label) {
    console.log('Analytics Event:', { category, action, label });
}

// Handle restaurant card clicks
function handleRestaurantClick(restaurantSlug) {
    trackEvent('Restaurant', 'View', restaurantSlug);
    window.location.href = `/restaurants/${restaurantSlug}.html`;
}

// Handle reservation clicks
function handleReservationClick(restaurant) {
    trackEvent('Reservation', 'Click', restaurant.name);
    if (restaurant.reservationLink) {
        window.open(restaurant.reservationLink, '_blank');
    }
}

// Handle call button clicks (mobile)
function handleCallClick(phone) {
    trackEvent('Contact', 'Call', phone);
    window.location.href = `tel:${phone}`;
}

// Handle directions click
function handleDirectionsClick(address) {
    trackEvent('Contact', 'Directions', address);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapsUrl, '_blank');
}

// Share functionality
function shareRestaurant(restaurant) {
    const shareData = {
        title: restaurant.name,
        text: `Check out ${restaurant.name} on Bay Area Family Eats!`,
        url: window.location.href
    };

    if (navigator.share) {
        navigator.share(shareData)
            .then(() => trackEvent('Social', 'Share', restaurant.name))
            .catch(err => console.log('Error sharing:', err));
    } else {
        copyToClipboard(window.location.href);
        showAlert('success', 'Link copied to clipboard!');
    }
}

// Copy to clipboard utility
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    });
}

// Format price range
function formatPriceRange(priceRange) {
    const prices = {
        '$': 'Under $15',
        '$$': '$15-$30',
        '$$$': '$30-$50',
        '$$$$': 'Over $50'
    };
    return prices[priceRange] || priceRange;
}

// Format hours
function formatHours(hours) {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return hours[today] || 'Closed';
}

// Check if restaurant is open now
function isOpenNow(hours) {
    const now = new Date();
    const today = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayHours = hours[today];

    if (!todayHours || todayHours === 'Closed') {
        return false;
    }

    return todayHours !== 'Closed';
}

// Initialize on page load
window.addEventListener('load', function() {
    lazyLoadImages();
    initializeBackToTop();
    initializeBreadcrumbs();
});

// Back to Top Button
function initializeBackToTop() {
    const backToTop = document.createElement('button');
    backToTop.id = 'backToTop';
    backToTop.innerHTML = '↑';
    backToTop.setAttribute('aria-label', 'Back to top');
    backToTop.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--primary-color, #e85d04);
        color: white;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
    `;
    document.body.appendChild(backToTop);

    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
        }
    });

    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Breadcrumb Navigation
function initializeBreadcrumbs() {
    const breadcrumbContainer = document.getElementById('breadcrumbs');
    if (!breadcrumbContainer) return;

    const path = window.location.pathname;
    const pathParts = path.split('/').filter(part => part);

    let breadcrumbHTML = '<a href="/">Home</a>';
    let currentPath = '';

    pathParts.forEach((part, index) => {
        currentPath += '/' + part;
        const isLast = index === pathParts.length - 1;

        let name = part.replace('.html', '').replace(/-/g, ' ');
        name = name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

        if (isLast) {
            breadcrumbHTML += ` <span style="color: var(--text-secondary);">›</span> <span>${name}</span>`;
        } else {
            breadcrumbHTML += ` <span style="color: var(--text-secondary);">›</span> <a href="${currentPath}">${name}</a>`;
        }
    });

    breadcrumbContainer.innerHTML = breadcrumbHTML;
}

// Loading State for Restaurant Grid
function showLoadingState(gridElement) {
    if (!gridElement) return;

    const loadingHTML = `
        <div class="loading-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
            <div class="loading-spinner" style="margin: 0 auto 1rem; width: 50px; height: 50px; border: 4px solid #eee; border-top-color: var(--primary-color, #e85d04); border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="color: #666;">Loading restaurants...</p>
        </div>
    `;
    gridElement.innerHTML = loadingHTML;

    if (!document.getElementById('spinner-keyframes')) {
        const style = document.createElement('style');
        style.id = 'spinner-keyframes';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Category Rating Functions
function createCategoryRatingsHTML(categoryRatings) {
    if (!categoryRatings) return '';

    const categories = Object.keys(categoryRatings);

    const ratingsHTML = categories.map(key => {
        const rating = categoryRatings[key];
        const label = DataLoader.categoryRatingLabels[key] || key;
        const icon = DataLoader.categoryRatingIcons[key] || '⭐';
        const description = DataLoader.categoryRatingDescriptions[key] || '';
        const percentage = (rating / 5) * 100;

        return `
            <div class="category-rating-item">
                <span class="category-rating-icon">${icon}</span>
                <div class="category-rating-content">
                    <div class="category-rating-header">
                        <span class="category-rating-label">${label}</span>
                        <span class="category-rating-value">${rating.toFixed(1)}</span>
                    </div>
                    <div class="category-rating-bar-container">
                        <div class="category-rating-bar" data-rating="${rating}" style="width: ${percentage}%"></div>
                    </div>
                    <div class="category-rating-description">${description}</div>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="category-ratings">
            <div class="category-ratings-header">
                <h3>Family-Friendly Ratings</h3>
            </div>
            <div class="category-ratings-grid">
                ${ratingsHTML}
            </div>
        </div>
    `;
}

function createReviewCategoryRatingsHTML(categoryRatings) {
    if (!categoryRatings) return '';

    const categories = Object.entries(categoryRatings);

    const ratingsHTML = categories.map(([key, rating]) => {
        const label = DataLoader.categoryRatingLabels[key] || key;
        const icon = DataLoader.categoryRatingIcons[key] || '⭐';

        return `
            <div class="review-category-item">
                <span class="review-category-label">
                    <span>${icon}</span>
                    <span>${label}</span>
                </span>
                <span class="review-category-value">${rating}/5</span>
            </div>
        `;
    }).join('');

    return `
        <div class="review-category-ratings">
            <div class="review-category-ratings-title">Category Ratings</div>
            <div class="review-category-ratings-grid">
                ${ratingsHTML}
            </div>
        </div>
    `;
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
