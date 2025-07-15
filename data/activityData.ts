// project/data/activityData.ts

import { Activity } from '@/types/activity';

export const activities: Activity[] = [
  // Sports
  {
    id: 'pickleball',
    name: 'Pickleball',
    category: 'sports',
    icon: '🏓',
    description: 'A fun paddle sport that combines elements of tennis, badminton, and ping-pong',
    equipment: ['paddles', 'balls', 'net'],
    transportation: true,
    indoor: true,
    outdoor: true,
    skillLevel: 'beginner',
    maxParticipants: 4,
    duration: 60
  },
  {
    id: 'tennis',
    name: 'Tennis',
    category: 'sports',
    icon: '🎾',
    description: 'Classic racket sport for singles or doubles play',
    equipment: ['rackets', 'balls', 'net'],
    transportation: true,
    indoor: true,
    outdoor: true,
    skillLevel: 'beginner',
    maxParticipants: 4,
    duration: 90
  },
  {
    id: 'soccer',
    name: 'Soccer',
    category: 'sports',
    icon: '⚽',
    description: 'Team sport played with a ball and goals',
    equipment: ['ball', 'goals'],
    transportation: true,
    indoor: false,
    outdoor: true,
    skillLevel: 'beginner',
    maxParticipants: 22,
    duration: 90
  },
  {
    id: 'basketball',
    name: 'Basketball',
    category: 'sports',
    icon: '🏀',
    description: 'Fast-paced team sport with hoops and scoring',
    equipment: ['ball', 'hoops'],
    transportation: true,
    indoor: true,
    outdoor: true,
    skillLevel: 'beginner',
    maxParticipants: 10,
    duration: 60
  },
  {
    id: 'volleyball',
    name: 'Volleyball',
    category: 'sports',
    icon: '🏐',
    description: 'Team sport with net and ball passing',
    equipment: ['ball', 'net'],
    transportation: true,
    indoor: true,
    outdoor: true,
    skillLevel: 'beginner',
    maxParticipants: 12,
    duration: 60
  },

  // Fitness
  {
    id: 'running',
    name: 'Running',
    category: 'fitness',
    icon: '🏃',
    description: 'Cardio exercise for endurance and fitness',
    equipment: ['running shoes'],
    transportation: false,
    indoor: false,
    outdoor: true,
    skillLevel: 'beginner',
    maxParticipants: 10,
    duration: 45
  },
  {
    id: 'cycling',
    name: 'Cycling',
    category: 'fitness',
    icon: '🚴',
    description: 'Bike riding for exercise and exploration',
    equipment: ['bicycle', 'helmet'],
    transportation: true,
    indoor: false,
    outdoor: true,
    skillLevel: 'beginner',
    maxParticipants: 8,
    duration: 60
  },
  {
    id: 'yoga',
    name: 'Yoga',
    category: 'fitness',
    icon: '🧘',
    description: 'Mind-body practice for flexibility and relaxation',
    equipment: ['yoga mat'],
    transportation: false,
    indoor: true,
    outdoor: true,
    skillLevel: 'beginner',
    maxParticipants: 15,
    duration: 60
  },
  {
    id: 'weightlifting',
    name: 'Weightlifting',
    category: 'fitness',
    icon: '🏋️',
    description: 'Strength training with weights and equipment',
    equipment: ['weights', 'bench'],
    transportation: true,
    indoor: true,
    outdoor: false,
    skillLevel: 'intermediate',
    maxParticipants: 4,
    duration: 60
  },

  // Volunteering
  {
    id: 'community_service',
    name: 'Community Service',
    category: 'volunteering',
    icon: '🤝',
    description: 'Helping others and giving back to the community',
    equipment: [],
    transportation: true,
    indoor: true,
    outdoor: true,
    skillLevel: 'beginner',
    maxParticipants: 20,
    duration: 120
  },
  {
    id: 'food_bank',
    name: 'Food Bank Volunteering',
    category: 'volunteering',
    icon: '🥫',
    description: 'Sorting and distributing food to those in need',
    equipment: [],
    transportation: true,
    indoor: true,
    outdoor: false,
    skillLevel: 'beginner',
    maxParticipants: 15,
    duration: 120
  },
  {
    id: 'animal_shelter',
    name: 'Animal Shelter',
    category: 'volunteering',
    icon: '🐕',
    description: 'Caring for and walking shelter animals',
    equipment: ['leashes'],
    transportation: true,
    indoor: true,
    outdoor: true,
    skillLevel: 'beginner',
    maxParticipants: 10,
    duration: 90
  },

  // Outdoor Activities
  {
    id: 'hiking',
    name: 'Hiking',
    category: 'outdoor',
    icon: '🏔️',
    description: 'Exploring nature trails and scenic paths',
    equipment: ['hiking boots', 'water bottle'],
    transportation: true,
    indoor: false,
    outdoor: true,
    skillLevel: 'beginner',
    maxParticipants: 8,
    duration: 180
  },
  {
    id: 'rock_climbing',
    name: 'Rock Climbing',
    category: 'outdoor',
    icon: '🧗',
    description: 'Climbing walls and natural rock formations',
    equipment: ['harness', 'rope', 'shoes'],
    transportation: true,
    indoor: true,
    outdoor: true,
    skillLevel: 'intermediate',
    maxParticipants: 6,
    duration: 120
  },
  {
    id: 'kayaking',
    name: 'Kayaking',
    category: 'outdoor',
    icon: '🛶',
    description: 'Paddling on water in small boats',
    equipment: ['kayak', 'paddle', 'life jacket'],
    transportation: true,
    indoor: false,
    outdoor: true,
    skillLevel: 'intermediate',
    maxParticipants: 6,
    duration: 120
  },

  // Social Activities
  {
    id: 'board_games',
    name: 'Board Games',
    category: 'social',
    icon: '🎲',
    description: 'Playing strategic and fun board games',
    equipment: ['games'],
    transportation: false,
    indoor: true,
    outdoor: false,
    skillLevel: 'beginner',
    maxParticipants: 8,
    duration: 120
  },
  {
    id: 'movie_night',
    name: 'Movie Night',
    category: 'social',
    icon: '🎬',
    description: 'Watching films together with friends',
    equipment: ['tv/projector'],
    transportation: false,
    indoor: true,
    outdoor: false,
    skillLevel: 'beginner',
    maxParticipants: 10,
    duration: 180
  },
  {
    id: 'cooking',
    name: 'Cooking Together',
    category: 'social',
    icon: '👨‍🍳',
    description: 'Preparing meals and learning new recipes',
    equipment: ['kitchen utensils'],
    transportation: false,
    indoor: true,
    outdoor: false,
    skillLevel: 'beginner',
    maxParticipants: 6,
    duration: 120
  },

  // Cultural Activities
  {
    id: 'language_exchange',
    name: 'Language Exchange',
    category: 'cultural',
    icon: '🗣️',
    description: 'Practicing different languages with native speakers',
    equipment: [],
    transportation: false,
    indoor: true,
    outdoor: true,
    skillLevel: 'beginner',
    maxParticipants: 6,
    duration: 60
  },
  {
    id: 'cultural_cooking',
    name: 'Cultural Cooking',
    category: 'cultural',
    icon: '🥘',
    description: 'Learning to cook traditional dishes from different cultures',
    equipment: ['kitchen utensils', 'ingredients'],
    transportation: false,
    indoor: true,
    outdoor: false,
    skillLevel: 'beginner',
    maxParticipants: 8,
    duration: 150
  },
  {
    id: 'dance_lessons',
    name: 'Dance Lessons',
    category: 'cultural',
    icon: '💃',
    description: 'Learning traditional and modern dance styles',
    equipment: ['dance shoes'],
    transportation: true,
    indoor: true,
    outdoor: false,
    skillLevel: 'beginner',
    maxParticipants: 12,
    duration: 90
  },

  // Hobbies
  {
    id: 'photography',
    name: 'Photography',
    category: 'hobby',
    icon: '📸',
    description: 'Capturing moments and exploring photography techniques',
    equipment: ['camera'],
    transportation: true,
    indoor: true,
    outdoor: true,
    skillLevel: 'beginner',
    maxParticipants: 6,
    duration: 120
  },
  {
    id: 'painting',
    name: 'Painting',
    category: 'hobby',
    icon: '🎨',
    description: 'Creating art with various painting techniques',
    equipment: ['paints', 'brushes', 'canvas'],
    transportation: false,
    indoor: true,
    outdoor: true,
    skillLevel: 'beginner',
    maxParticipants: 8,
    duration: 120
  },
  {
    id: 'music_jam',
    name: 'Music Jam Session',
    category: 'hobby',
    icon: '🎵',
    description: 'Playing instruments and making music together',
    equipment: ['instruments'],
    transportation: false,
    indoor: true,
    outdoor: true,
    skillLevel: 'beginner',
    maxParticipants: 6,
    duration: 90
  }
];

export const getActivitiesByCategory = (category: string) => {
  return activities.filter(activity => activity.category === category);
};

export const getActivityById = (id: string) => {
  return activities.find(activity => activity.id === id);
};

export const getActivityCategories = () => {
  const categories = [...new Set(activities.map(activity => activity.category))];
  return categories;
}; 