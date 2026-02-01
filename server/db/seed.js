/**
 * Database Seed Script
 * Populates the database with initial data including all restaurants from the original dataset
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'familyeats.sqlite');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

console.log('Seeding database...\n');

// Seed locations
const locations = [
  { name: 'San Francisco', state: 'CA' },
  { name: 'Oakland', state: 'CA' },
  { name: 'Berkeley', state: 'CA' },
  { name: 'Palo Alto', state: 'CA' },
  { name: 'San Jose', state: 'CA' },
  { name: 'Mountain View', state: 'CA' },
  { name: 'Walnut Creek', state: 'CA' },
  { name: 'San Mateo', state: 'CA' },
  { name: 'Fremont', state: 'CA' },
  { name: 'Santa Clara', state: 'CA' }
];

const insertLocation = db.prepare('INSERT INTO locations (name, state) VALUES (?, ?)');
const locationMap = {};
locations.forEach(loc => {
  const result = insertLocation.run(loc.name, loc.state);
  locationMap[loc.name] = result.lastInsertRowid;
});
console.log(`Inserted ${locations.length} locations`);

// Seed cuisines
const cuisines = [
  { name: 'American', icon: '🍔' },
  { name: 'Italian', icon: '🍝' },
  { name: 'Mexican', icon: '🌮' },
  { name: 'Asian', icon: '🍜' },
  { name: 'Pizza', icon: '🍕' },
  { name: 'Chinese', icon: '🥡' },
  { name: 'Japanese', icon: '🍣' },
  { name: 'Indian', icon: '🍛' },
  { name: 'Thai', icon: '🍲' },
  { name: 'Mediterranean', icon: '🥙' },
  { name: 'BBQ', icon: '🍖' },
  { name: 'Seafood', icon: '🦐' },
  { name: 'Vegetarian', icon: '🥗' },
  { name: 'Breakfast', icon: '🥞' },
  { name: 'Bakery', icon: '🧁' }
];

const insertCuisine = db.prepare('INSERT INTO cuisines (name, icon) VALUES (?, ?)');
const cuisineMap = {};
cuisines.forEach(c => {
  const result = insertCuisine.run(c.name, c.icon);
  cuisineMap[c.name] = result.lastInsertRowid;
});
console.log(`Inserted ${cuisines.length} cuisines`);

// Seed features
const features = [
  { key: 'highChairs', label: 'High Chairs', icon: '👶', description: 'High chairs available for infants and toddlers' },
  { key: 'kidsMenu', label: 'Kids Menu', icon: '🍽️', description: 'Special menu options for children' },
  { key: 'changingTable', label: 'Changing Table', icon: '🚼', description: 'Baby changing facilities in restrooms' },
  { key: 'playArea', label: 'Play Area', icon: '🎮', description: 'Dedicated play space for children' },
  { key: 'outdoorSeating', label: 'Outdoor Seating', icon: '🌳', description: 'Patio or outdoor dining available' },
  { key: 'patientStaff', label: 'Patient Staff', icon: '😊', description: 'Staff trained to be patient with families' },
  { key: 'boosterSeats', label: 'Booster Seats', icon: '🪑', description: 'Booster seats for older toddlers' },
  { key: 'crayons', label: 'Crayons & Activities', icon: '🖍️', description: 'Coloring and activities provided' },
  { key: 'birthdayParties', label: 'Birthday Parties', icon: '🎂', description: 'Birthday party packages available' },
  { key: 'privateRoom', label: 'Private Room', icon: '🚪', description: 'Private dining room available' },
  { key: 'wheelchairAccessible', label: 'Wheelchair Accessible', icon: '♿', description: 'Fully wheelchair accessible' },
  { key: 'parking', label: 'Parking Available', icon: '🅿️', description: 'Parking lot or validated parking' },
  { key: 'reservations', label: 'Reservations', icon: '📅', description: 'Reservations accepted' },
  { key: 'takeout', label: 'Takeout', icon: '📦', description: 'Takeout orders available' },
  { key: 'delivery', label: 'Delivery', icon: '🚗', description: 'Delivery service available' }
];

const insertFeature = db.prepare('INSERT INTO features (key, label, icon, description) VALUES (?, ?, ?, ?)');
const featureMap = {};
features.forEach(f => {
  const result = insertFeature.run(f.key, f.label, f.icon, f.description);
  featureMap[f.key] = result.lastInsertRowid;
});
console.log(`Inserted ${features.length} features`);

// Seed age ranges
const ageRanges = [
  { key: 'infant', label: 'Infants (0-1)', minAge: 0, maxAge: 1 },
  { key: 'toddler', label: 'Toddlers (1-3)', minAge: 1, maxAge: 3 },
  { key: 'young', label: 'Young Kids (4-7)', minAge: 4, maxAge: 7 },
  { key: 'tweens', label: 'Tweens (8-12)', minAge: 8, maxAge: 12 },
  { key: 'teens', label: 'Teens (13-17)', minAge: 13, maxAge: 17 }
];

const insertAgeRange = db.prepare('INSERT INTO age_ranges (key, label, min_age, max_age) VALUES (?, ?, ?, ?)');
const ageRangeMap = {};
ageRanges.forEach(a => {
  const result = insertAgeRange.run(a.key, a.label, a.minAge, a.maxAge);
  ageRangeMap[a.key] = result.lastInsertRowid;
});
console.log(`Inserted ${ageRanges.length} age ranges`);

// Seed category types
const categoryTypes = [
  { key: 'kidsMenu', label: 'Kid-Friendly Menu', icon: '🍽️', description: 'Quality and variety of children\'s menu options' },
  { key: 'staff', label: 'Staff Patience', icon: '😊', description: 'How patient and accommodating staff are with families' },
  { key: 'cleanliness', label: 'Cleanliness', icon: '✨', description: 'Overall cleanliness including bathrooms and changing facilities' },
  { key: 'noiseTolerance', label: 'Noise Tolerance', icon: '🔊', description: 'How welcoming they are to normal kid noise' },
  { key: 'entertainment', label: 'Entertainment', icon: '🎮', description: 'Play areas, activities, and entertainment for kids' },
  { key: 'valueForMoney', label: 'Value for Money', icon: '💰', description: 'Price vs. quality for family dining' },
  { key: 'waitTime', label: 'Wait Time', icon: '⏱️', description: 'How quickly food arrives at your table' },
  { key: 'spaciousness', label: 'Spaciousness', icon: '📏', description: 'Room for strollers, high chairs, and moving around' }
];

const insertCategory = db.prepare('INSERT INTO category_types (key, label, icon, description) VALUES (?, ?, ?, ?)');
const categoryMap = {};
categoryTypes.forEach(c => {
  const result = insertCategory.run(c.key, c.label, c.icon, c.description);
  categoryMap[c.key] = result.lastInsertRowid;
});
console.log(`Inserted ${categoryTypes.length} category types`);

// Restaurant data
const restaurantsData = [
  {
    name: "The Little Dipper Diner",
    slug: "little-dipper-diner",
    location: "San Francisco",
    neighborhood: "Mission District",
    cuisine: "American",
    priceRange: "$$",
    rating: 4.8,
    reviewCount: 342,
    images: ["/images/restaurants/little-dipper-1.jpg", "/images/restaurants/little-dipper-2.jpg", "/images/restaurants/little-dipper-3.jpg"],
    featured: true,
    premium: true,
    description: "A cozy family diner with a dedicated kids play area and a menu that appeals to all ages. The patient staff goes above and beyond to make families feel welcome.",
    features: { highChairs: true, kidsMenu: true, changingTable: true, playArea: true, outdoorSeating: true, patientStaff: true },
    noiseLevel: "moderate",
    ageRange: ["toddler", "young", "tweens"],
    hours: {
      monday: "8:00 AM - 9:00 PM",
      tuesday: "8:00 AM - 9:00 PM",
      wednesday: "8:00 AM - 9:00 PM",
      thursday: "8:00 AM - 9:00 PM",
      friday: "8:00 AM - 10:00 PM",
      saturday: "9:00 AM - 10:00 PM",
      sunday: "9:00 AM - 9:00 PM"
    },
    address: "1234 Valencia St, San Francisco, CA 94110",
    phone: "(415) 555-0123",
    website: "https://littledipperdiner.com",
    reservationLink: "https://www.opentable.com/little-dipper-diner",
    coordinates: { lat: 37.7599, lng: -122.4148 },
    categoryRatings: { kidsMenu: 4.8, staff: 4.9, cleanliness: 4.7, noiseTolerance: 4.8, entertainment: 4.9, valueForMoney: 4.6, waitTime: 4.4, spaciousness: 4.7 }
  },
  {
    name: "Pasta Palace",
    slug: "pasta-palace",
    location: "Oakland",
    neighborhood: "Rockridge",
    cuisine: "Italian",
    priceRange: "$$$",
    rating: 4.6,
    reviewCount: 218,
    images: ["/images/restaurants/pasta-palace-1.jpg", "/images/restaurants/pasta-palace-2.jpg"],
    featured: true,
    premium: false,
    description: "Authentic Italian cuisine in a family-friendly atmosphere. Kids love watching the chefs make fresh pasta through the open kitchen windows.",
    features: { highChairs: true, kidsMenu: true, changingTable: true, playArea: false, outdoorSeating: true, patientStaff: true },
    noiseLevel: "quiet",
    ageRange: ["young", "tweens", "teens"],
    hours: {
      monday: "Closed",
      tuesday: "5:00 PM - 9:00 PM",
      wednesday: "5:00 PM - 9:00 PM",
      thursday: "5:00 PM - 9:00 PM",
      friday: "5:00 PM - 10:00 PM",
      saturday: "12:00 PM - 10:00 PM",
      sunday: "12:00 PM - 9:00 PM"
    },
    address: "5678 College Ave, Oakland, CA 94618",
    phone: "(510) 555-0456",
    website: "https://pastapalace.com",
    reservationLink: "https://www.opentable.com/pasta-palace",
    coordinates: { lat: 37.8444, lng: -122.2512 },
    categoryRatings: { kidsMenu: 4.7, staff: 4.8, cleanliness: 4.9, noiseTolerance: 4.2, entertainment: 3.8, valueForMoney: 4.3, waitTime: 4.1, spaciousness: 4.6 }
  },
  {
    name: "Taco Fiesta",
    slug: "taco-fiesta",
    location: "Berkeley",
    neighborhood: "Downtown",
    cuisine: "Mexican",
    priceRange: "$",
    rating: 4.7,
    reviewCount: 567,
    images: ["/images/restaurants/taco-fiesta-1.jpg", "/images/restaurants/taco-fiesta-2.jpg"],
    featured: true,
    premium: true,
    description: "Vibrant Mexican restaurant with a beautiful outdoor patio. The colorful decor and friendly mariachi music create a festive atmosphere perfect for family celebrations.",
    features: { highChairs: true, kidsMenu: true, changingTable: true, playArea: false, outdoorSeating: true, patientStaff: true },
    noiseLevel: "lively",
    ageRange: ["toddler", "young", "tweens", "teens"],
    hours: {
      monday: "11:00 AM - 9:00 PM",
      tuesday: "11:00 AM - 9:00 PM",
      wednesday: "11:00 AM - 9:00 PM",
      thursday: "11:00 AM - 9:00 PM",
      friday: "11:00 AM - 10:00 PM",
      saturday: "10:00 AM - 10:00 PM",
      sunday: "10:00 AM - 9:00 PM"
    },
    address: "2345 Shattuck Ave, Berkeley, CA 94704",
    phone: "(510) 555-0789",
    website: "https://tacofiesta.com",
    reservationLink: null,
    coordinates: { lat: 37.8688, lng: -122.2677 },
    categoryRatings: { kidsMenu: 4.6, staff: 4.9, cleanliness: 4.5, noiseTolerance: 4.9, entertainment: 4.4, valueForMoney: 4.8, waitTime: 4.6, spaciousness: 4.7 }
  },
  {
    name: "Sunny Side Cafe",
    slug: "sunny-side-cafe",
    location: "Palo Alto",
    neighborhood: "University Avenue",
    cuisine: "American",
    priceRange: "$$",
    rating: 4.9,
    reviewCount: 423,
    images: ["/images/restaurants/sunny-side-1.jpg", "/images/restaurants/sunny-side-2.jpg"],
    featured: true,
    premium: true,
    description: "The go-to spot for family brunch. Famous for their kids-eat-free Sunday policy and the huge outdoor garden with sandbox and toys.",
    features: { highChairs: true, kidsMenu: true, changingTable: true, playArea: true, outdoorSeating: true, patientStaff: true },
    noiseLevel: "moderate",
    ageRange: ["toddler", "young"],
    hours: {
      monday: "7:00 AM - 3:00 PM",
      tuesday: "7:00 AM - 3:00 PM",
      wednesday: "7:00 AM - 3:00 PM",
      thursday: "7:00 AM - 3:00 PM",
      friday: "7:00 AM - 3:00 PM",
      saturday: "8:00 AM - 4:00 PM",
      sunday: "8:00 AM - 4:00 PM"
    },
    address: "456 University Ave, Palo Alto, CA 94301",
    phone: "(650) 555-0234",
    website: "https://sunnysidecafe.com",
    reservationLink: "https://www.opentable.com/sunny-side-cafe",
    coordinates: { lat: 37.4467, lng: -122.1598 },
    categoryRatings: { kidsMenu: 4.9, staff: 5.0, cleanliness: 4.8, noiseTolerance: 4.9, entertainment: 5.0, valueForMoney: 4.8, waitTime: 4.7, spaciousness: 4.9 }
  },
  {
    name: "Dragon Bowl",
    slug: "dragon-bowl",
    location: "San Jose",
    neighborhood: "Santana Row",
    cuisine: "Asian",
    priceRange: "$$",
    rating: 4.5,
    reviewCount: 289,
    images: ["/images/restaurants/dragon-bowl-1.jpg"],
    featured: true,
    premium: false,
    description: "Modern Asian fusion with a kid-friendly menu. The build-your-own-bowl concept is a hit with picky eaters.",
    features: { highChairs: true, kidsMenu: true, changingTable: true, playArea: false, outdoorSeating: false, patientStaff: true },
    noiseLevel: "quiet",
    ageRange: ["young", "tweens", "teens"],
    hours: {
      monday: "11:00 AM - 9:00 PM",
      tuesday: "11:00 AM - 9:00 PM",
      wednesday: "11:00 AM - 9:00 PM",
      thursday: "11:00 AM - 9:00 PM",
      friday: "11:00 AM - 10:00 PM",
      saturday: "11:00 AM - 10:00 PM",
      sunday: "11:00 AM - 9:00 PM"
    },
    address: "789 Santana Row, San Jose, CA 95128",
    phone: "(408) 555-0567",
    website: "https://dragonbowl.com",
    reservationLink: "https://www.opentable.com/dragon-bowl",
    coordinates: { lat: 37.3230, lng: -121.9483 },
    categoryRatings: { kidsMenu: 4.6, staff: 4.7, cleanliness: 4.8, noiseTolerance: 4.0, entertainment: 3.5, valueForMoney: 4.4, waitTime: 4.8, spaciousness: 4.3 }
  },
  {
    name: "Pizza Paradise",
    slug: "pizza-paradise",
    location: "San Francisco",
    neighborhood: "North Beach",
    cuisine: "Pizza",
    priceRange: "$$",
    rating: 4.7,
    reviewCount: 512,
    images: ["/images/restaurants/pizza-paradise-1.jpg"],
    featured: false,
    premium: false,
    description: "Classic pizzeria with a fun, casual atmosphere. Kids can watch pizza being tossed and there's a game room with arcade machines.",
    features: { highChairs: true, kidsMenu: true, changingTable: true, playArea: true, outdoorSeating: false, patientStaff: true },
    noiseLevel: "lively",
    ageRange: ["young", "tweens", "teens"],
    hours: {
      monday: "11:00 AM - 10:00 PM",
      tuesday: "11:00 AM - 10:00 PM",
      wednesday: "11:00 AM - 10:00 PM",
      thursday: "11:00 AM - 10:00 PM",
      friday: "11:00 AM - 11:00 PM",
      saturday: "11:00 AM - 11:00 PM",
      sunday: "11:00 AM - 10:00 PM"
    },
    address: "321 Columbus Ave, San Francisco, CA 94133",
    phone: "(415) 555-0890",
    website: "https://pizzaparadise.com",
    reservationLink: null,
    coordinates: { lat: 37.7989, lng: -122.4075 },
    categoryRatings: { kidsMenu: 4.5, staff: 4.6, cleanliness: 4.4, noiseTolerance: 4.9, entertainment: 4.8, valueForMoney: 4.7, waitTime: 4.5, spaciousness: 4.4 }
  }
];

// Helper to parse hours
function parseHours(hoursStr) {
  if (!hoursStr || hoursStr.toLowerCase() === 'closed') {
    return { isClosed: true, open: null, close: null };
  }
  const [open, close] = hoursStr.split(' - ');
  return { isClosed: false, open: open.trim(), close: close.trim() };
}

const dayMap = { monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4, saturday: 5, sunday: 6 };

// Insert restaurants
const insertRestaurant = db.prepare(`
  INSERT INTO restaurants (
    name, slug, location_id, neighborhood, cuisine_id, price_range,
    rating, review_count, featured, premium, description, address,
    phone, website, reservation_link, latitude, longitude, noise_level
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertImage = db.prepare('INSERT INTO restaurant_images (restaurant_id, url, is_primary, sort_order) VALUES (?, ?, ?, ?)');
const insertRestaurantFeature = db.prepare('INSERT INTO restaurant_features (restaurant_id, feature_id, value) VALUES (?, ?, ?)');
const insertRestaurantAgeRange = db.prepare('INSERT INTO restaurant_age_ranges (restaurant_id, age_range_id) VALUES (?, ?)');
const insertHours = db.prepare('INSERT INTO restaurant_hours (restaurant_id, day_of_week, open_time, close_time, is_closed) VALUES (?, ?, ?, ?, ?)');
const insertCategoryRating = db.prepare('INSERT INTO restaurant_category_ratings (restaurant_id, category_id, rating) VALUES (?, ?, ?)');

const insertAllRestaurantData = db.transaction((restaurants) => {
  for (const r of restaurants) {
    // Insert main restaurant
    const result = insertRestaurant.run(
      r.name,
      r.slug,
      locationMap[r.location],
      r.neighborhood,
      cuisineMap[r.cuisine],
      r.priceRange,
      r.rating,
      r.reviewCount,
      r.featured ? 1 : 0,
      r.premium ? 1 : 0,
      r.description,
      r.address,
      r.phone,
      r.website,
      r.reservationLink,
      r.coordinates.lat,
      r.coordinates.lng,
      r.noiseLevel
    );
    const restaurantId = result.lastInsertRowid;

    // Insert images
    r.images.forEach((img, idx) => {
      insertImage.run(restaurantId, img, idx === 0 ? 1 : 0, idx);
    });

    // Insert features
    Object.entries(r.features).forEach(([key, value]) => {
      if (featureMap[key] && value) {
        insertRestaurantFeature.run(restaurantId, featureMap[key], 1);
      }
    });

    // Insert age ranges
    r.ageRange.forEach(age => {
      if (ageRangeMap[age]) {
        insertRestaurantAgeRange.run(restaurantId, ageRangeMap[age]);
      }
    });

    // Insert hours
    Object.entries(r.hours).forEach(([day, hours]) => {
      const parsed = parseHours(hours);
      insertHours.run(restaurantId, dayMap[day], parsed.open, parsed.close, parsed.isClosed ? 1 : 0);
    });

    // Insert category ratings
    Object.entries(r.categoryRatings).forEach(([key, rating]) => {
      if (categoryMap[key]) {
        insertCategoryRating.run(restaurantId, categoryMap[key], rating);
      }
    });
  }
});

insertAllRestaurantData(restaurantsData);
console.log(`Inserted ${restaurantsData.length} restaurants with all related data`);

// Seed reviews
const reviewsData = [
  {
    restaurantSlug: "little-dipper-diner",
    userName: "Sarah M.",
    userInitials: "SM",
    rating: 5,
    date: "2024-11-10",
    text: "This place is a lifesaver! The play area kept my 3-year-old entertained while we enjoyed a peaceful meal. The staff brought crayons and coloring books without us even asking.",
    highlight: "The outdoor patio has misters for hot days and the kids menu is actually healthy - not just chicken nuggets!",
    categoryRatings: { kidsMenu: 5, staff: 5, cleanliness: 5, noiseTolerance: 5, entertainment: 5, valueForMoney: 4, waitTime: 4, spaciousness: 5 }
  },
  {
    restaurantSlug: "sunny-side-cafe",
    userName: "Mike T.",
    userInitials: "MT",
    rating: 5,
    date: "2024-11-12",
    text: "Best brunch spot for families, hands down. The garden area is amazing - my kids played in the sandbox while we relaxed. Kids eat free on Sundays is a huge bonus!",
    highlight: "They have a diaper changing station in both restrooms and the staff is incredibly patient.",
    categoryRatings: { kidsMenu: 5, staff: 5, cleanliness: 5, noiseTolerance: 5, entertainment: 5, valueForMoney: 5, waitTime: 5, spaciousness: 5 }
  },
  {
    restaurantSlug: "taco-fiesta",
    userName: "Jessica R.",
    userInitials: "JR",
    rating: 5,
    date: "2024-11-14",
    text: "We celebrated our daughter's 8th birthday here and it was perfect. The staff sang happy birthday, brought out a special dessert, and the kids loved the festive atmosphere.",
    highlight: "Great for families who don't mind a little noise - the lively atmosphere means your kids won't be the loudest ones there!",
    categoryRatings: { kidsMenu: 5, staff: 5, cleanliness: 4, noiseTolerance: 5, entertainment: 4, valueForMoney: 5, waitTime: 5, spaciousness: 5 }
  }
];

// Get restaurant IDs by slug
const getRestaurantBySlug = db.prepare('SELECT id FROM restaurants WHERE slug = ?');
const insertReview = db.prepare(`
  INSERT INTO reviews (restaurant_id, user_name, user_initials, rating, text, highlight, visit_date, is_verified, is_approved)
  VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1)
`);
const insertReviewCategoryRating = db.prepare('INSERT INTO review_category_ratings (review_id, category_id, rating) VALUES (?, ?, ?)');

const insertAllReviews = db.transaction((reviews) => {
  for (const rev of reviews) {
    const restaurant = getRestaurantBySlug.get(rev.restaurantSlug);
    if (restaurant) {
      const result = insertReview.run(
        restaurant.id,
        rev.userName,
        rev.userInitials,
        rev.rating,
        rev.text,
        rev.highlight,
        rev.date
      );
      const reviewId = result.lastInsertRowid;

      // Insert category ratings
      Object.entries(rev.categoryRatings).forEach(([key, rating]) => {
        if (categoryMap[key]) {
          insertReviewCategoryRating.run(reviewId, categoryMap[key], rating);
        }
      });
    }
  }
});

insertAllReviews(reviewsData);
console.log(`Inserted ${reviewsData.length} reviews with category ratings`);

// Seed sample users
const users = [
  { email: 'admin@bayareafamilyeats.com', name: 'Admin User', initials: 'AU', isAdmin: 1 },
  { email: 'sarah@example.com', name: 'Sarah M.', initials: 'SM', isAdmin: 0 },
  { email: 'mike@example.com', name: 'Mike T.', initials: 'MT', isAdmin: 0 },
  { email: 'jessica@example.com', name: 'Jessica R.', initials: 'JR', isAdmin: 0 }
];

const insertUser = db.prepare('INSERT INTO users (email, name, initials, is_admin, is_verified) VALUES (?, ?, ?, ?, 1)');
users.forEach(u => {
  insertUser.run(u.email, u.name, u.initials, u.isAdmin);
});
console.log(`Inserted ${users.length} users`);

db.close();

console.log('\nDatabase seeded successfully!');
