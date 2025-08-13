const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting database seeding...');

    // Create a test user
    await prisma.user.deleteMany({});
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'alex.chen@stanford.edu',
        passwordHash: hashedPassword,
        fullName: 'Alex Chen',
        university: 'Stanford University',
        major: 'Computer Science',
        year: 'Junior',
        state: 'California',
        city: 'Palo Alto',
        bio: 'Passionate about technology and preserving cultural traditions. Love connecting with fellow students from around the world! 🌍',
        linkedin: 'linkedin.com/in/alexchen',
        heritage: ['Chinese', 'Taiwanese'],
        languages: ['English', 'Mandarin', 'Cantonese'],
        profileImage: 'https://example.com/alex-profile.jpg'
      }
    });
    
    console.log('Created test user:', user.email);

    // Try to fetch mockEvents from API first (if server is running)
    let mockEvents;
    try {
      const response = await axios.get('http://localhost:3001/api/seed/events');
      mockEvents = response.data;
      console.log('Fetched mock events from API');
    } catch (apiError) {
      // Fallback to reading from file
      console.log('Could not fetch from API, using local file');
      const mockEventsPath = path.join(__dirname, '../../data/mockEvents.json');
      mockEvents = JSON.parse(fs.readFileSync(mockEventsPath, 'utf-8'));
    }

    // Clean up the events table before seeding
    await prisma.event.deleteMany({});
    console.log('Cleared existing events');

    for (const event of mockEvents) {
      await prisma.event.create({
        data: {
          name: event.name,
          description: event.description,
          isRSVPed: event.isRSVPed || false,
          isFavorited: event.isFavorited || false,
          image: event.image, // Updated from imageUrl to image
          images: event.image ? [event.image] : [], // Create images array from single image
          date: new Date(event.date),
          time: event.time,
          location: event.location,
          categories: event.category || [],
          organizer: event.organizer,
          attendees: event.attendees || 1,
        },
      });
    }

    console.log(`Database has been seeded with ${mockEvents.length} events`);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
