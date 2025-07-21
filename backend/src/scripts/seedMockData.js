require('dotenv').config();
const { sequelize, User, Group, Event, Media, SocialMedia } = require('../models');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Helper function to extract groups, events, and users directly from file
async function seedMockData() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Manually create mock users
    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create test user 1
    const [user1, created1] = await User.findOrCreate({
      where: { email: 'john.doe@example.com' },
      defaults: {
        id: uuidv4(),
        name: 'John Doe',
        email: 'john.doe@example.com',
        username: 'john.doe',
        password: hashedPassword,
        university: 'Stanford University',
        major: 'Computer Science',
        year: 'Junior',
        title: 'Computer Science Student',
        heritage: ['American', 'Italian'],
        languages: ['English', 'Italian'],
        bio: 'I am a computer science student passionate about technology and culture.',
        image: 'https://randomuser.me/api/portraits/men/1.jpg',
        location: 'Palo Alto, CA',
        country: 'United States',
        state: 'California',
        verified: true,
        isPublic: true
      }
    });
    
    if (created1) {
      console.log(`Created user: ${user1.name}`);
    } else {
      console.log(`User already exists: ${user1.name}`);
    }
    
    // Create test user 2
    const [user2, created2] = await User.findOrCreate({
      where: { email: 'maria.rodriguez@example.com' },
      defaults: {
        id: uuidv4(),
        name: 'Maria Rodriguez',
        email: 'maria.rodriguez@example.com',
        username: 'maria.rodriguez',
        password: hashedPassword,
        university: 'Stanford University',
        major: 'International Relations',
        year: 'Senior',
        title: 'International Relations Student',
        heritage: ['Mexican', 'Hispanic'],
        languages: ['English', 'Spanish'],
        bio: 'International relations student with a love for Latin American culture.',
        image: 'https://randomuser.me/api/portraits/women/1.jpg',
        location: 'Stanford, CA',
        country: 'United States',
        state: 'California',
        verified: true,
        isPublic: true
      }
    });
    
    if (created2) {
      console.log(`Created user: ${user2.name}`);
    } else {
      console.log(`User already exists: ${user2.name}`);
    }
    
    // Create test user 3
    const [user3, created3] = await User.findOrCreate({
      where: { email: 'aisha.patel@example.com' },
      defaults: {
        id: uuidv4(),
        name: 'Aisha Patel',
        email: 'aisha.patel@example.com',
        username: 'aisha.patel',
        password: hashedPassword,
        university: 'Stanford University',
        major: 'Biology',
        year: 'Sophomore',
        title: 'Biology Student',
        heritage: ['Indian', 'South Asian'],
        languages: ['English', 'Hindi', 'Gujarati'],
        bio: 'Biology student interested in medical research and South Asian cultural events.',
        image: 'https://randomuser.me/api/portraits/women/2.jpg',
        location: 'Menlo Park, CA',
        country: 'United States',
        state: 'California',
        verified: true,
        isPublic: true
      }
    });
    
    if (created3) {
      console.log(`Created user: ${user3.name}`);
    } else {
      console.log(`User already exists: ${user3.name}`);
    }
    
    // Create test groups
    const [group1, groupCreated1] = await Group.findOrCreate({
      where: { name: 'South Asian Student Alliance' },
      defaults: {
        id: uuidv4(),
        name: 'South Asian Student Alliance',
        description: 'A community for South Asian students to connect, celebrate, and share cultural experiences.',
        memberCount: 156,
        category: 'South Asian',
        location: 'Stanford University',
        isPublic: true,
        recentActivity: '2 hours ago',
        image: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=300',
        upcomingEvents: 4,
        universityOnly: true,
        allowedUniversity: 'Stanford University',
        meetingTime: '7:00 PM',
        meetingDate: 'Thursdays',
        meetingLocation: 'Student Center Room 101',
        meetingDays: ['Thursday'],
        presidentId: user3.id
      }
    });
    
    if (groupCreated1) {
      console.log(`Created group: ${group1.name}`);
      await group1.addMember(user3);
      console.log(`Added ${user3.name} as president and member to ${group1.name}`);
      await group1.addMember(user1);
      await group1.addMember(user2);
      
      // Add social media for the group
      await SocialMedia.create({
        platform: 'instagram',
        link: 'https://instagram.com/sasagroup',
        groupId: group1.id
      });
      
      await SocialMedia.create({
        platform: 'facebook',
        link: 'https://facebook.com/sasagroup',
        groupId: group1.id
      });
      
      console.log(`Added social media links to ${group1.name}`);
    } else {
      console.log(`Group already exists: ${group1.name}`);
    }
    
    // Create test group 2
    const [group2, groupCreated2] = await Group.findOrCreate({
      where: { name: 'Latino Student Association' },
      defaults: {
        id: uuidv4(),
        name: 'Latino Student Association',
        description: 'A vibrant community promoting Latino culture, heritage, and issues on campus.',
        memberCount: 120,
        category: 'Latino',
        location: 'Stanford University',
        isPublic: true,
        recentActivity: '1 day ago',
        image: 'https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=300',
        upcomingEvents: 2,
        universityOnly: true,
        allowedUniversity: 'Stanford University',
        meetingTime: '6:30 PM',
        meetingDate: 'Wednesdays',
        meetingLocation: 'Cultural Center',
        meetingDays: ['Wednesday'],
        presidentId: user2.id
      }
    });
    
    if (groupCreated2) {
      console.log(`Created group: ${group2.name}`);
      await group2.addMember(user2);
      console.log(`Added ${user2.name} as president and member to ${group2.name}`);
      await group2.addMember(user1);
      
      // Add social media for the group
      await SocialMedia.create({
        platform: 'instagram',
        link: 'https://instagram.com/latinostudents',
        groupId: group2.id
      });
      
      console.log(`Added social media links to ${group2.name}`);
    } else {
      console.log(`Group already exists: ${group2.name}`);
    }
    
    // Create test events
    const [event1, eventCreated1] = await Event.findOrCreate({
      where: { title: 'Lunar New Year Festival' },
      defaults: {
        id: uuidv4(),
        title: 'Lunar New Year Festival',
        name: 'Lunar New Year Festival',
        description: 'Welcome the Year of the Snake with traditional lantern making, calligraphy workshops, dumplings, and lion dance performances. Red envelopes with surprises for all attendees!',
        date: 'Feb 10, 2024',
        time: '6:00 PM',
        location: 'Student Center Ballroom',
        category: ['Chinese', 'East Asian', 'Vietnamese'],
        organizer: 'Chinese Students & Scholars Association',
        attendees: 156,
        maxAttendees: 200,
        image: 'https://images.pexels.com/photos/6786961/pexels-photo-6786961.jpeg?auto=compress&cs=tinysrgb&w=400',
        price: '$7',
        distance: '0.2 miles',
        groupId: group1.id
      }
    });
    
    if (eventCreated1) {
      console.log(`Created event: ${event1.title}`);
    } else {
      console.log(`Event already exists: ${event1.title}`);
    }
    
    // Create test event 2
    const [event2, eventCreated2] = await Event.findOrCreate({
      where: { title: 'Diwali Festival of Lights' },
      defaults: {
        id: uuidv4(),
        title: 'Diwali Festival of Lights',
        name: 'Diwali Festival of Lights',
        description: 'Celebrate the festival of lights with traditional performances, authentic Indian food, rangoli making, and fireworks display. Join us for an evening of joy and cultural celebration!',
        date: 'Oct 28, 2024',
        time: '7:00 PM',
        location: 'Grand Hall',
        category: ['Indian', 'South Asian', 'Hindu'],
        organizer: 'Indian Students Association',
        attendees: 245,
        maxAttendees: 300,
        image: 'https://images.pexels.com/photos/1482691/pexels-photo-1482691.jpeg?auto=compress&cs=tinysrgb&w=400',
        price: '$10',
        distance: '0.1 miles',
        groupId: group1.id
      }
    });
    
    if (eventCreated2) {
      console.log(`Created event: ${event2.title}`);
    } else {
      console.log(`Event already exists: ${event2.title}`);
    }
    
    // Create test event 3
    const [event3, eventCreated3] = await Event.findOrCreate({
      where: { title: 'Latin American Cultural Showcase' },
      defaults: {
        id: uuidv4(),
        title: 'Latin American Cultural Showcase',
        name: 'Latin American Cultural Showcase',
        description: 'Experience the rich cultural diversity of Latin America through music, dance, art, and cuisine. Features performances from various countries and authentic food tastings.',
        date: 'Apr 15, 2024',
        time: '5:30 PM',
        location: 'University Auditorium',
        category: ['Latino', 'Hispanic', 'Cultural'],
        organizer: 'Latino Student Association',
        attendees: 180,
        maxAttendees: 250,
        image: 'https://images.pexels.com/photos/59989/pexels-photo-59989.jpeg?auto=compress&cs=tinysrgb&w=400',
        price: '$5',
        distance: '0.3 miles',
        groupId: group2.id
      }
    });
    
    if (eventCreated3) {
      console.log(`Created event: ${event3.title}`);
    } else {
      console.log(`Event already exists: ${event3.title}`);
    }
    
    // Create connections between users
    await user1.addConnection(user2);
    await user2.addConnection(user1);
    console.log(`Added connection between ${user1.name} and ${user2.name}`);
    
    await user1.addConnection(user3);
    await user3.addConnection(user1);
    console.log(`Added connection between ${user1.name} and ${user3.name}`);
    
    // RSVP users to events using the UserEvents through table
    await event1.addAttendee(user1);
    await event1.addAttendee(user2);
    await event1.addAttendee(user3);
    console.log(`Added users as attendees to ${event1.title}`);
    
    await event2.addAttendee(user1);
    await event2.addAttendee(user3);
    console.log(`Added users as attendees to ${event2.title}`);
    
    await event3.addAttendee(user1);
    await event3.addAttendee(user2);
    console.log(`Added users as attendees to ${event3.title}`);
    
    console.log('Mock data seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding mock data:', error);
  } finally {
    process.exit();
  }
}

seedMockData(); 