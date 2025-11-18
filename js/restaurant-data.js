// Restaurant Data Structure
// This would typically come from a backend API, but for now we'll use static data

const restaurantsData = [
    {
        id: 1,
        name: "The Little Dipper Diner",
        slug: "little-dipper-diner",
        location: "San Francisco",
        neighborhood: "Mission District",
        cuisine: "American",
        priceRange: "$$",
        rating: 4.8,
        reviewCount: 342,
        images: [
            "/images/restaurants/little-dipper-1.jpg",
            "/images/restaurants/little-dipper-2.jpg",
            "/images/restaurants/little-dipper-3.jpg"
        ],
        featured: true,
        premium: true,
        description: "A cozy family diner with a dedicated kids play area and a menu that appeals to all ages. The patient staff goes above and beyond to make families feel welcome.",
        features: {
            highChairs: true,
            kidsMenu: true,
            changingTable: true,
            playArea: true,
            outdoorSeating: true,
            noiseLevel: "moderate",
            patientStaff: true
        },
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
        coordinates: { lat: 37.7599, lng: -122.4148 }
    },
    {
        id: 2,
        name: "Pasta Palace",
        slug: "pasta-palace",
        location: "Oakland",
        neighborhood: "Rockridge",
        cuisine: "Italian",
        priceRange: "$$$",
        rating: 4.6,
        reviewCount: 218,
        images: [
            "/images/restaurants/pasta-palace-1.jpg",
            "/images/restaurants/pasta-palace-2.jpg"
        ],
        featured: true,
        premium: false,
        description: "Authentic Italian cuisine in a family-friendly atmosphere. Kids love watching the chefs make fresh pasta through the open kitchen windows.",
        features: {
            highChairs: true,
            kidsMenu: true,
            changingTable: true,
            playArea: false,
            outdoorSeating: true,
            noiseLevel: "quiet",
            patientStaff: true
        },
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
        coordinates: { lat: 37.8444, lng: -122.2512 }
    },
    {
        id: 3,
        name: "Taco Fiesta",
        slug: "taco-fiesta",
        location: "Berkeley",
        neighborhood: "Downtown",
        cuisine: "Mexican",
        priceRange: "$",
        rating: 4.7,
        reviewCount: 567,
        images: [
            "/images/restaurants/taco-fiesta-1.jpg",
            "/images/restaurants/taco-fiesta-2.jpg"
        ],
        featured: true,
        premium: true,
        description: "Vibrant Mexican restaurant with a beautiful outdoor patio. The colorful decor and friendly mariachi music create a festive atmosphere perfect for family celebrations.",
        features: {
            highChairs: true,
            kidsMenu: true,
            changingTable: true,
            playArea: false,
            outdoorSeating: true,
            noiseLevel: "lively",
            patientStaff: true
        },
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
        coordinates: { lat: 37.8688, lng: -122.2677 }
    },
    {
        id: 4,
        name: "Sunny Side Cafe",
        slug: "sunny-side-cafe",
        location: "Palo Alto",
        neighborhood: "University Avenue",
        cuisine: "American",
        priceRange: "$$",
        rating: 4.9,
        reviewCount: 423,
        images: [
            "/images/restaurants/sunny-side-1.jpg",
            "/images/restaurants/sunny-side-2.jpg"
        ],
        featured: true,
        premium: true,
        description: "The go-to spot for family brunch. Famous for their kids-eat-free Sunday policy and the huge outdoor garden with sandbox and toys.",
        features: {
            highChairs: true,
            kidsMenu: true,
            changingTable: true,
            playArea: true,
            outdoorSeating: true,
            noiseLevel: "moderate",
            patientStaff: true
        },
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
        coordinates: { lat: 37.4467, lng: -122.1598 }
    },
    {
        id: 5,
        name: "Dragon Bowl",
        slug: "dragon-bowl",
        location: "San Jose",
        neighborhood: "Santana Row",
        cuisine: "Asian",
        priceRange: "$$",
        rating: 4.5,
        reviewCount: 289,
        images: [
            "/images/restaurants/dragon-bowl-1.jpg"
        ],
        featured: true,
        premium: false,
        description: "Modern Asian fusion with a kid-friendly menu. The build-your-own-bowl concept is a hit with picky eaters.",
        features: {
            highChairs: true,
            kidsMenu: true,
            changingTable: true,
            playArea: false,
            outdoorSeating: false,
            noiseLevel: "quiet",
            patientStaff: true
        },
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
        coordinates: { lat: 37.3230, lng: -121.9483 }
    },
    {
        id: 6,
        name: "Pizza Paradise",
        slug: "pizza-paradise",
        location: "San Francisco",
        neighborhood: "North Beach",
        cuisine: "Pizza",
        priceRange: "$$",
        rating: 4.7,
        reviewCount: 512,
        images: [
            "/images/restaurants/pizza-paradise-1.jpg"
        ],
        featured: false,
        premium: false,
        description: "Classic pizzeria with a fun, casual atmosphere. Kids can watch pizza being tossed and there's a game room with arcade machines.",
        features: {
            highChairs: true,
            kidsMenu: true,
            changingTable: true,
            playArea: true,
            outdoorSeating: false,
            noiseLevel: "lively",
            patientStaff: true
        },
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
        coordinates: { lat: 37.7989, lng: -122.4075 }
    }
];

// Sample reviews data
const reviewsData = [
    {
        id: 1,
        restaurantId: 1,
        restaurantName: "The Little Dipper Diner",
        userName: "Sarah M.",
        userInitials: "SM",
        rating: 5,
        date: "2024-11-10",
        text: "This place is a lifesaver! The play area kept my 3-year-old entertained while we enjoyed a peaceful meal. The staff brought crayons and coloring books without us even asking.",
        highlight: "The outdoor patio has misters for hot days and the kids menu is actually healthy - not just chicken nuggets!"
    },
    {
        id: 2,
        restaurantId: 4,
        restaurantName: "Sunny Side Cafe",
        userName: "Mike T.",
        userInitials: "MT",
        rating: 5,
        date: "2024-11-12",
        text: "Best brunch spot for families, hands down. The garden area is amazing - my kids played in the sandbox while we relaxed. Kids eat free on Sundays is a huge bonus!",
        highlight: "They have a diaper changing station in both restrooms and the staff is incredibly patient."
    },
    {
        id: 3,
        restaurantId: 3,
        restaurantName: "Taco Fiesta",
        userName: "Jessica R.",
        userInitials: "JR",
        rating: 5,
        date: "2024-11-14",
        text: "We celebrated our daughter's 8th birthday here and it was perfect. The staff sang happy birthday, brought out a special dessert, and the kids loved the festive atmosphere.",
        highlight: "Great for families who don't mind a little noise - the lively atmosphere means your kids won't be the loudest ones there!"
    }
];

// Feature icons mapping
const featureIcons = {
    highChairs: '👶',
    kidsMenu: '🍽️',
    changingTable: '🚼',
    playArea: '🎮',
    outdoorSeating: '🌳',
    patientStaff: '😊'
};

// Feature labels
const featureLabels = {
    highChairs: 'High Chairs',
    kidsMenu: 'Kids Menu',
    changingTable: 'Changing Table',
    playArea: 'Play Area',
    outdoorSeating: 'Outdoor Seating',
    patientStaff: 'Patient Staff'
};
