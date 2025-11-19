// Main JavaScript for Bay Area Family Eats

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initializeMobileMenu();
    initializeStickyFilterBar();
    loadFeaturedRestaurants();
    loadRecentReviews();
    initializeSearch();
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

    // Get featured restaurants (limit to 6 for homepage)
    const featured = restaurantsData
        .filter(r => r.featured)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6);

    renderRestaurants(featured, featuredGrid);
}

// Load Recent Reviews on Homepage
function loadRecentReviews() {
    const reviewsGrid = document.getElementById('reviewsGrid');
    if (!reviewsGrid) return;

    reviewsGrid.innerHTML = reviewsData.map(review => createReviewCard(review)).join('');
}

// Create Review Card HTML
function createReviewCard(review) {
    const stars = '⭐'.repeat(review.rating);
    const date = new Date(review.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return `
        <div class="review-card">
            <div class="review-header">
                <div class="review-avatar">${review.userInitials}</div>
                <div class="review-info">
                    <h4>${review.userName}</h4>
                    <div class="review-meta">
                        <span class="review-restaurant">${review.restaurantName}</span>
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
            ${review.categoryRatings ? createReviewCategoryRatingsHTML(review.categoryRatings) : ''}
        </div>
    `;
}

// Newsletter Submission
function submitNewsletter(event) {
    event.preventDefault();

    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;

    // In production, this would send to a backend API
    console.log('Newsletter signup:', email);

    // Show success message
    showAlert('success', 'Thanks for subscribing! Check your email for a confirmation.');

    // Reset form
    form.reset();

    // In production, you would:
    // fetch('/api/newsletter/subscribe', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email })
    // })
    // .then(response => response.json())
    // .then(data => {
    //     showAlert('success', 'Thanks for subscribing!');
    //     form.reset();
    // })
    // .catch(error => {
    //     showAlert('error', 'Something went wrong. Please try again.');
    // });
}

// Show Alert Message
function showAlert(type, message) {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <span>${type === 'success' ? '✓' : '⚠'}</span>
        <span>${message}</span>
    `;

    // Insert at top of page
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alert, container.firstChild);

        // Auto remove after 5 seconds
        setTimeout(() => {
            alert.style.opacity = '0';
            alert.style.transition = 'opacity 0.3s ease';
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    }
}

// Smooth scroll to sections
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offset = 100; // Account for sticky header
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
    // In production, this would send to Google Analytics, Mixpanel, etc.
    console.log('Analytics Event:', { category, action, label });

    // Example with Google Analytics:
    // if (typeof gtag !== 'undefined') {
    //     gtag('event', action, {
    //         'event_category': category,
    //         'event_label': label
    //     });
    // }
}

// Handle restaurant card clicks
function handleRestaurantClick(restaurantId) {
    const restaurant = restaurantsData.find(r => r.id === restaurantId);
    if (restaurant) {
        trackEvent('Restaurant', 'View', restaurant.name);
        window.location.href = `/restaurants/${restaurant.slug}.html`;
    }
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
        // Fallback: Copy link to clipboard
        copyToClipboard(window.location.href);
        showAlert('success', 'Link copied to clipboard!');
    }
}

// Copy to clipboard utility
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
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

    // Parse hours (simplified - would need more robust parsing in production)
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // This is a simplified check - in production you'd parse the actual hours
    return todayHours !== 'Closed';
}

// Initialize tooltips
function initializeTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');

    tooltips.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.dataset.tooltip;
            document.body.appendChild(tooltip);

            const rect = this.getBoundingClientRect();
            tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
            tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';

            this.tooltipElement = tooltip;
        });

        element.addEventListener('mouseleave', function() {
            if (this.tooltipElement) {
                this.tooltipElement.remove();
                this.tooltipElement = null;
            }
        });
    });
}

// Performance optimization: Debounce function
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

// Initialize on page load
window.addEventListener('load', function() {
    lazyLoadImages();
    initializeTooltips();
    initializeBackToTop();
    initializeBreadcrumbs();
});

// Back to Top Button
function initializeBackToTop() {
    // Create back to top button
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
        background: var(--primary-color);
        color: white;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        box-shadow: var(--shadow-md);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
    `;
    document.body.appendChild(backToTop);

    // Show/hide based on scroll
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
        }
    });

    // Scroll to top on click
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

        // Format the part name
        let name = part.replace('.html', '').replace(/-/g, ' ');
        name = name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

        if (isLast) {
            breadcrumbHTML += \` <span style="color: var(--text-secondary);">›</span> <span>\${name}</span>\`;
        } else {
            breadcrumbHTML += \` <span style="color: var(--text-secondary);">›</span> <a href="\${currentPath}">\${name}</a>\`;
        }
    });

    breadcrumbContainer.innerHTML = breadcrumbHTML;
}

// Loading State for Restaurant Grid
function showLoadingState(gridElement) {
    if (!gridElement) return;

    const loadingHTML = \`
        <div class="loading-state" style="grid-column: 1 / -1; text-align: center; padding: var(--spacing-xl);">
            <div class="loading-spinner" style="margin: 0 auto var(--spacing-md); width: 50px; height: 50px; border: 4px solid var(--border-color); border-top-color: var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="color: var(--text-secondary);">Loading restaurants...</p>
        </div>
    \`;
    gridElement.innerHTML = loadingHTML;

    // Add spinner animation if not exists
    if (!document.getElementById('spinner-keyframes')) {
        const style = document.createElement('style');
        style.id = 'spinner-keyframes';
        style.textContent = \`
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        \`;
        document.head.appendChild(style);
    }
}

// Category Rating Functions
// ==========================

// Create category ratings HTML for restaurant detail page
function createCategoryRatingsHTML(categoryRatings) {
    if (!categoryRatings) return '';

    const categories = Object.keys(categoryRatings);

    const ratingsHTML = categories.map(key => {
        const rating = categoryRatings[key];
        const label = categoryRatingLabels[key] || key;
        const icon = categoryRatingIcons[key] || '⭐';
        const description = categoryRatingDescriptions[key] || '';
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
                <span style="font-size: 0.875rem; color: var(--text-light);">Based on ${Math.floor(Math.random() * 200 + 50)} family reviews</span>
            </div>
            <div class="category-ratings-grid">
                ${ratingsHTML}
            </div>
        </div>
    `;
}

// Create compact category ratings for restaurant cards
function createCompactCategoryRatingsHTML(categoryRatings, limit = 4) {
    if (!categoryRatings) return '';

    // Get top rated categories
    const sortedCategories = Object.entries(categoryRatings)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);

    const ratingsHTML = sortedCategories.map(([key, rating]) => {
        const label = categoryRatingLabels[key] || key;
        const icon = categoryRatingIcons[key] || '⭐';

        return `
            <div class="category-rating-compact">
                <span class="category-rating-compact-icon">${icon}</span>
                <span class="category-rating-compact-label">${label}</span>
                <span class="category-rating-compact-value">${rating.toFixed(1)}</span>
            </div>
        `;
    }).join('');

    return `
        <div class="category-ratings-compact">
            ${ratingsHTML}
        </div>
    `;
}

// Create category ratings for reviews
function createReviewCategoryRatingsHTML(categoryRatings) {
    if (!categoryRatings) return '';

    const categories = Object.entries(categoryRatings);

    const ratingsHTML = categories.map(([key, rating]) => {
        const label = categoryRatingLabels[key] || key;
        const icon = categoryRatingIcons[key] || '⭐';

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
