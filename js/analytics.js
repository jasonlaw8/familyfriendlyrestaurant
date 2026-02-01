/**
 * Google Analytics Configuration
 *
 * To enable Google Analytics:
 * 1. Get your GA4 Measurement ID from Google Analytics (format: G-XXXXXXXXXX)
 * 2. Replace 'G-XXXXXXXXXX' below with your actual Measurement ID
 * 3. Deploy the updated file
 */

// Google Analytics Measurement ID - Replace with your actual ID
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

// Initialize Google Analytics
function initializeAnalytics() {
    // Don't initialize if no valid measurement ID
    if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
        console.log('Google Analytics: No measurement ID configured');
        return;
    }

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
        'page_title': document.title,
        'page_location': window.location.href,
        'page_path': window.location.pathname
    });

    console.log('Google Analytics initialized:', GA_MEASUREMENT_ID);
}

// Track page views (for SPA-like navigation)
function trackPageView(pagePath, pageTitle) {
    if (typeof gtag === 'function') {
        gtag('config', GA_MEASUREMENT_ID, {
            'page_path': pagePath || window.location.pathname,
            'page_title': pageTitle || document.title
        });
    }
}

// Track custom events
function trackEvent(eventName, eventParams = {}) {
    if (typeof gtag === 'function') {
        gtag('event', eventName, eventParams);
    }
}

// Track restaurant views
function trackRestaurantView(restaurantName, restaurantId) {
    trackEvent('view_restaurant', {
        'restaurant_name': restaurantName,
        'restaurant_id': restaurantId
    });
}

// Track search queries
function trackSearch(searchTerm, resultsCount) {
    trackEvent('search', {
        'search_term': searchTerm,
        'results_count': resultsCount
    });
}

// Track filter usage
function trackFilter(filterType, filterValue) {
    trackEvent('filter_applied', {
        'filter_type': filterType,
        'filter_value': filterValue
    });
}

// Track newsletter signup
function trackNewsletterSignup() {
    trackEvent('newsletter_signup', {
        'method': 'footer_form'
    });
}

// Track contact form submission
function trackContactSubmission() {
    trackEvent('contact_form_submit');
}

// Track review submission
function trackReviewSubmission(restaurantName) {
    trackEvent('review_submitted', {
        'restaurant_name': restaurantName
    });
}

// Track outbound links (reservations, directions, etc.)
function trackOutboundLink(url, linkType) {
    trackEvent('click', {
        'event_category': 'outbound',
        'event_label': url,
        'link_type': linkType
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeAnalytics);

// Export for use in other scripts
window.Analytics = {
    trackPageView,
    trackEvent,
    trackRestaurantView,
    trackSearch,
    trackFilter,
    trackNewsletterSignup,
    trackContactSubmission,
    trackReviewSubmission,
    trackOutboundLink
};
