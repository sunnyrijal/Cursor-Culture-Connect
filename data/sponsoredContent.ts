import { Utensils, Music, Palette, Camera } from 'lucide-react-native';
import { theme, spacing, borderRadius, typography } from '@/components/theme';
export const sponsoredContent = [
  {
    id: 1,
    type: 'restaurant',
    title: 'Maharaja Palace',
    subtitle: 'Authentic Indian Cuisine',
    description:
      'Experience traditional flavors from across India with our tandoor specialties, biryanis, and fresh naan bread.',
    image:
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: '$$-$$$',
    rating: 4.8,
    location: 'Downtown Minneapolis',
    phone: '(612) 555-0123',
    hours: '11 AM - 10 PM',
    offer: '20% Student Discount',
    cta: 'View Menu',
    icon: Utensils,
    color: theme.warning,
    heritage: 'Indian',
    popularityByHeritage: { Indian: 120, Nepali: 42, Pakistani: 10 },
    link:"http://localhost:8081"
  },
  {
    id: 2,
    type: 'event',
    title: 'Asian Art Festival',
    subtitle: 'Contemporary & Traditional Art',
    description:
      'Explore stunning artworks from emerging Asian artists featuring calligraphy, paintings, and sculptures.',
    image:
      'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 'Free for Students',
    date: 'Nov 15-17',
    location: 'Walker Art Center',
    phone: '(612) 375-7600',
    offer: 'Free Student Entry',
    cta: 'Get Tickets',
    icon: Palette,
    color: theme.accent,
    heritage: 'Asian',
    link:"http://localhost:8081"

  },
  {
    id: 3,
    type: 'restaurant',
    title: 'Tacos El Sol',
    subtitle: 'Mexican Street Food',
    description:
      'Authentic Mexican flavors with fresh ingredients, handmade tortillas, and traditional recipes passed down through generations.',
    image:
      'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: '$-$$',
    rating: 4.6,
    location: 'West Bank',
    phone: '(612) 555-0456',
    hours: '10 AM - 11 PM',
    offer: 'Free Guacamole on Tuesdays',
    cta: 'Order Now',
    icon: Utensils,
    color: theme.success,
    heritage: 'Mexican',
    popularityByHeritage: { Mexican: 80, Nepali: 2 },
    link:"http://localhost:8081"

  },
  {
    id: 4,
    type: 'event',
    title: 'African Drum Circle',
    subtitle: 'Traditional Rhythms & Dance',
    description:
      'Join our weekly drum circle featuring traditional African rhythms, dance performances, and cultural storytelling.',
    image:
      'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: 'Free',
    date: 'Every Friday',
    location: 'Northrop Mall',
    phone: '(612) 555-0789',
    offer: 'Drums Provided',
    cta: 'Join Circle',
    icon: Music,
    color: theme.primary,
    heritage: 'African',
    link:"http://localhost:8081"

  },
  {
    id: 5,
    type: 'restaurant',
    title: 'Pho Saigon',
    subtitle: 'Vietnamese Comfort Food',
    description:
      'Warm bowls of pho, fresh spring rolls, and authentic Vietnamese dishes made with love and traditional recipes.',
    image:
      'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: '$-$$',
    rating: 4.7,
    location: 'Dinkytown',
    phone: '(612) 555-0321',
    hours: '11 AM - 9 PM',
    offer: 'Student Lunch Special',
    cta: 'View Menu',
    icon: Utensils,
    color: theme.info,
    heritage: 'Vietnamese',
    popularityByHeritage: { Vietnamese: 60, Nepali: 8 },
    link:"http://localhost:8081"

  },
  {
    id: 6,
    type: 'event',
    title: 'Middle Eastern Film Festival',
    subtitle: 'Cinema & Culture',
    description:
      'A week-long celebration of Middle Eastern cinema featuring award-winning films, director Q&As, and cultural discussions.',
    image:
      'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: '$5 per film',
    date: 'Dec 1-7',
    location: 'Bell Museum',
    phone: '(612) 555-0654',
    offer: 'Festival Pass Available',
    cta: 'Get Pass',
    icon: Camera,
    color: theme.warning,
    heritage: 'Middle Eastern',
    link:"http://localhost:8081"

  },
  {
    id: 7,
    type: 'restaurant',
    title: 'Sakura Sushi',
    subtitle: 'Japanese Fine Dining',
    description:
      'Premium sushi and sashimi prepared by master chefs using the freshest ingredients and traditional Japanese techniques.',
    image:
      'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: '$$$-$$$$',
    rating: 4.9,
    location: 'Uptown',
    phone: '(612) 555-0987',
    hours: '5 PM - 11 PM',
    offer: 'Happy Hour 5-7 PM',
    cta: 'Reserve Table',
    icon: Utensils,
    color: theme.accent,
    heritage: 'Japanese',
    popularityByHeritage: { Japanese: 70, Nepali: 1 },
    link:"http://localhost:8081"

  },
  {
    id: 8,
    type: 'event',
    title: 'Caribbean Carnival',
    subtitle: 'Music, Dance & Culture',
    description:
      'Experience the vibrant colors, infectious rhythms, and rich cultural heritage of the Caribbean through music and dance.',
    image:
      'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=400',
    price: '$15',
    date: 'Dec 15',
    location: 'Theater District',
    phone: '(612) 555-0123',
    offer: 'Early Bird Discount',
    cta: 'Buy Tickets',
    icon: Music,
    color: theme.success,
    heritage: 'Caribbean',
    link:"http://localhost:8081"

  },
];

export const sponsoredCategories = [
  { id: 'all', label: 'All' },
  { id: 'restaurant', label: 'Restaurants' },
  { id: 'event', label: 'Events' },
  // Add more categories as needed, e.g. museums, shops, etc.
];
