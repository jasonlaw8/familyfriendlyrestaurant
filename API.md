# Bay Area Family Eats - API Documentation

## Overview

The Bay Area Family Eats API provides RESTful endpoints for accessing restaurant data, reviews, and managing user interactions.

**Base URL:** `http://localhost:3000/api`

## Quick Start

```bash
# Install dependencies
npm install

# Initialize and seed the database
npm run db:reset

# Start the server
npm start

# Or use development mode with auto-reload
npm run dev
```

## Endpoints

### Restaurants

#### List Restaurants
```http
GET /api/restaurants
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `location` | string | Filter by city name (e.g., "San Francisco") |
| `cuisine` | string | Filter by cuisine type (e.g., "Italian") |
| `priceRange` | string | Filter by price range: `$`, `$$`, `$$$`, or `$$$$` |
| `features` | string | Comma-separated feature keys (e.g., "playArea,kidsMenu") |
| `ageRange` | string | Comma-separated age ranges (e.g., "toddler,young") |
| `minRating` | number | Minimum rating (0-5) |
| `featured` | boolean | Filter for featured restaurants only |
| `sort` | string | Sort by: `rating`, `reviewCount`, `name`, `newest` |
| `order` | string | Sort order: `asc` or `desc` |
| `limit` | integer | Number of results (default: 50, max: 100) |
| `offset` | integer | Pagination offset |

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "The Little Dipper Diner",
      "slug": "little-dipper-diner",
      "location": "San Francisco",
      "neighborhood": "Mission District",
      "cuisine": "American",
      "cuisineIcon": "🍔",
      "priceRange": "$$",
      "rating": 4.8,
      "reviewCount": 342,
      "featured": true,
      "premium": true,
      "description": "A cozy family diner...",
      "images": [{"url": "/images/...", "isPrimary": true}],
      "features": {"playArea": {"label": "Play Area", "icon": "🎮"}},
      "ageRanges": [{"key": "toddler", "label": "Toddlers (1-3)"}],
      "categoryRatings": {"kidsMenu": {"rating": 4.8, "label": "Kid-Friendly Menu"}}
    }
  ],
  "pagination": {
    "total": 6,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

#### Get Featured Restaurants
```http
GET /api/restaurants/featured?limit=6
```

#### Get Restaurant Details
```http
GET /api/restaurants/:slug
```

**Response includes:**
- Full restaurant details
- All images
- Operating hours
- Complete category ratings
- All features and age ranges

#### Get Restaurant Reviews
```http
GET /api/restaurants/:slug/reviews?limit=10&offset=0&sort=newest
```

---

### Reviews

#### List All Reviews
```http
GET /api/reviews?limit=20&offset=0&sort=newest
```

**Sort options:** `newest`, `oldest`, `highest`, `lowest`

#### Get Recent Reviews
```http
GET /api/reviews/recent?limit=5
```

#### Submit a Review
```http
POST /api/reviews
Content-Type: application/json

{
  "restaurantId": 1,
  "userName": "John D.",
  "email": "john@example.com",
  "rating": 5,
  "title": "Amazing family experience!",
  "text": "We had such a great time here with our kids...",
  "highlight": "The play area was perfect!",
  "visitDate": "2024-01-15",
  "categoryRatings": {
    "kidsMenu": 5,
    "staff": 5,
    "cleanliness": 4,
    "noiseTolerance": 5,
    "entertainment": 5,
    "valueForMoney": 4,
    "waitTime": 4,
    "spaciousness": 5
  }
}
```

**Note:** Reviews are submitted for moderation and won't appear immediately.

#### Mark Review as Helpful
```http
POST /api/reviews/:id/helpful
```

---

### Filters

#### Get All Filter Options
```http
GET /api/filters
```

**Response:**
```json
{
  "data": {
    "locations": [{"id": 1, "name": "San Francisco", "restaurantCount": 2}],
    "cuisines": [{"id": 1, "name": "American", "icon": "🍔", "restaurantCount": 2}],
    "features": [{"id": 1, "key": "playArea", "label": "Play Area", "icon": "🎮"}],
    "ageRanges": [{"id": 1, "key": "toddler", "label": "Toddlers (1-3)"}],
    "categoryTypes": [...],
    "priceRanges": [{"priceRange": "$", "restaurantCount": 1}],
    "noiseLevels": [{"noiseLevel": "moderate", "restaurantCount": 2}]
  }
}
```

#### Individual Filter Endpoints
```http
GET /api/filters/locations
GET /api/filters/cuisines
GET /api/filters/features
```

---

### Contact & Newsletter

#### Submit Contact Form
```http
POST /api/contact
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "subject": "Question about listings",
  "message": "I'd like to add my restaurant to your directory..."
}
```

#### Subscribe to Newsletter
```http
POST /api/contact/newsletter/subscribe
Content-Type: application/json

{
  "email": "subscriber@example.com",
  "name": "Optional Name"
}
```

#### Unsubscribe from Newsletter
```http
POST /api/contact/newsletter/unsubscribe
Content-Type: application/json

{
  "email": "subscriber@example.com"
}
```

---

### Statistics

#### Get All Statistics
```http
GET /api/stats
```

**Response:**
```json
{
  "data": {
    "stats": {
      "restaurants": 6,
      "reviews": 3,
      "locations": 5,
      "featuredRestaurants": 5,
      "averageRating": 4.7,
      "totalReviewCount": 2351,
      "subscribers": 0
    },
    "topRated": [...],
    "mostReviewed": [...],
    "cuisineDistribution": [...],
    "locationDistribution": [...]
  }
}
```

#### Get Homepage Statistics
```http
GET /api/stats/homepage
```

---

### Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Database Schema

### Core Tables
- **restaurants** - Main restaurant information
- **reviews** - User reviews with ratings
- **users** - User accounts

### Lookup Tables
- **locations** - Cities/areas
- **cuisines** - Cuisine types
- **features** - Restaurant amenities
- **age_ranges** - Age group categories
- **category_types** - Rating categories

### Junction Tables
- **restaurant_images** - Restaurant photos
- **restaurant_features** - Restaurant-feature mapping
- **restaurant_age_ranges** - Restaurant-age mapping
- **restaurant_hours** - Operating hours
- **restaurant_category_ratings** - Aggregate ratings
- **review_category_ratings** - Individual review ratings

### Supporting Tables
- **contact_submissions** - Contact form entries
- **newsletter_subscribers** - Email subscriptions

---

## Error Handling

All errors return JSON in this format:

```json
{
  "error": "Error message",
  "errors": [
    {"field": "email", "message": "Invalid email format"}
  ]
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

---

## Development

### NPM Scripts

```bash
npm start       # Start production server
npm run dev     # Start with auto-reload
npm run db:init # Create database tables
npm run db:seed # Populate with sample data
npm run db:reset # Reset and reseed database
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
```
