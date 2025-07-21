require('dotenv').config();
const { sequelize, Activity } = require('../models');

async function seedActivities() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Define activities to seed
    const activities = [
      {
        name: 'Basketball',
        category: 'sports',
        icon: '🏀',
        description: 'Play basketball at local courts or gyms',
        equipment: ['Basketball'],
        transportation: true,
        indoor: true,
        outdoor: true,
        skillLevel: 'beginner',
        maxParticipants: 10,
        duration: 120
      },
      {
        name: 'Soccer',
        category: 'sports',
        icon: '⚽',
        description: 'Play soccer at local fields or parks',
        equipment: ['Soccer ball', 'Cleats'],
        transportation: true,
        indoor: false,
        outdoor: true,
        skillLevel: 'beginner',
        maxParticipants: 22,
        duration: 90
      },
      {
        name: 'Hiking',
        category: 'outdoor',
        icon: '🥾',
        description: 'Explore local trails and nature areas',
        equipment: ['Hiking boots', 'Backpack', 'Water bottle'],
        transportation: true,
        indoor: false,
        outdoor: true,
        skillLevel: 'beginner',
        maxParticipants: 8,
        duration: 180
      },
      {
        name: 'Yoga',
        category: 'fitness',
        icon: '🧘',
        description: 'Practice yoga together, suitable for all levels',
        equipment: ['Yoga mat'],
        transportation: false,
        indoor: true,
        outdoor: true,
        skillLevel: 'beginner',
        maxParticipants: 6,
        duration: 60
      },
      {
        name: 'Food Bank Volunteering',
        category: 'volunteering',
        icon: '🥫',
        description: 'Help sort food and prepare meals at local food banks',
        equipment: [],
        transportation: true,
        indoor: true,
        outdoor: false,
        skillLevel: 'beginner',
        maxParticipants: 10,
        duration: 180
      },
      {
        name: 'Board Games',
        category: 'social',
        icon: '🎲',
        description: 'Play board games, card games, and tabletop games',
        equipment: ['Board games'],
        transportation: false,
        indoor: true,
        outdoor: false,
        skillLevel: 'beginner',
        maxParticipants: 8,
        duration: 180
      },
      {
        name: 'Cultural Cooking',
        category: 'cultural',
        icon: '👨‍🍳',
        description: 'Cook and share dishes from your cultural background',
        equipment: ['Cooking ingredients', 'Cooking utensils'],
        transportation: false,
        indoor: true,
        outdoor: false,
        skillLevel: 'beginner',
        maxParticipants: 6,
        duration: 180
      },
      {
        name: 'Language Exchange',
        category: 'cultural',
        icon: '🗣️',
        description: 'Practice speaking different languages with native speakers',
        equipment: [],
        transportation: false,
        indoor: true,
        outdoor: true,
        skillLevel: 'beginner',
        maxParticipants: 10,
        duration: 120
      },
      {
        name: 'Photography Walk',
        category: 'hobby',
        icon: '📸',
        description: 'Explore the area and take photos together',
        equipment: ['Camera or smartphone'],
        transportation: true,
        indoor: false,
        outdoor: true,
        skillLevel: 'beginner',
        maxParticipants: 8,
        duration: 180
      },
      {
        name: 'Running Group',
        category: 'fitness',
        icon: '🏃',
        description: 'Go for runs together at various paces',
        equipment: ['Running shoes'],
        transportation: false,
        indoor: false,
        outdoor: true,
        skillLevel: 'beginner',
        maxParticipants: 10,
        duration: 60
      },
      {
        name: 'Tennis',
        category: 'sports',
        icon: '🎾',
        description: 'Play tennis at local courts',
        equipment: ['Tennis racket', 'Tennis balls'],
        transportation: true,
        indoor: true,
        outdoor: true,
        skillLevel: 'beginner',
        maxParticipants: 4,
        duration: 120
      },
      {
        name: 'Swimming',
        category: 'fitness',
        icon: '🏊',
        description: 'Swim laps or enjoy recreational swimming',
        equipment: ['Swimsuit', 'Goggles'],
        transportation: true,
        indoor: true,
        outdoor: true,
        skillLevel: 'beginner',
        maxParticipants: 6,
        duration: 90
      }
    ];

    // Create activities in the database
    for (const activityData of activities) {
      const [activity, created] = await Activity.findOrCreate({
        where: { name: activityData.name },
        defaults: activityData
      });

      if (created) {
        console.log(`Created activity: ${activity.name}`);
      } else {
        console.log(`Activity already exists: ${activity.name}`);
      }
    }

    console.log('Activities seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding activities:', error);
  } finally {
    process.exit();
  }
}

seedActivities(); 