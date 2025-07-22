const bcrypt = require('bcrypt');
const { User, Group, Event, GroupRequest, EventRequest, Notification } = require('../models');
const { v4: uuidv4 } = require('uuid');

// Mock data from the frontend
const mockData = {
  users: [
    {
      id: uuidv4(),
      username: 'aishapatel',
      email: 'aisha.patel@harvard.edu',
      password: 'password123',
      fullName: 'Aisha Patel',
      university: 'Harvard University',
      culturalBackground: 'Indian',
      interests: ['Medicine', 'Bollywood dancing'],
      avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Med student passionate about health equity and Bollywood dancing! 💃',
      major: 'Medicine',
      year: 'Graduate',
      languages: ['Hindi', 'Gujarati', 'English'],
      heritage: ['Indian', 'South Asian']
    },
    {
      id: uuidv4(),
      username: 'priyagupta',
      email: 'priya.gupta@edu.oxford.ac.uk',
      password: 'password123',
      fullName: 'Priya Gupta',
      university: 'Oxford University',
      culturalBackground: 'Indian',
      interests: ['Business', 'Entrepreneurship'],
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Business student passionate about sustainable entrepreneurship and Indian culture! 🌱',
      major: 'Business Administration',
      year: 'Junior',
      languages: ['Hindi', 'English', 'Punjabi'],
      heritage: ['Indian', 'South Asian']
    },
    {
      id: uuidv4(),
      username: 'weichen',
      email: 'wei.chen@tsinghua.edu',
      password: 'password123',
      fullName: 'Wei Chen',
      university: 'Tsinghua University',
      culturalBackground: 'Chinese',
      interests: ['Computer Science', 'AI'],
      avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'CS student passionate about AI and machine learning research.',
      major: 'Computer Science',
      year: 'Senior',
      languages: ['Mandarin', 'English'],
      heritage: ['Chinese', 'East Asian']
    },
    {
      id: uuidv4(),
      username: 'mariarodriguez',
      email: 'maria.rodriguez@harvard.edu',
      password: 'password123',
      fullName: 'Maria Rodriguez',
      university: 'Harvard University',
      culturalBackground: 'Mexican',
      interests: ['International Business', 'Cooking'],
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Passionate about bridging cultures through business and food!',
      major: 'International Business',
      year: 'Senior',
      languages: ['Spanish', 'English'],
      heritage: ['Mexican', 'Hispanic/Latino']
    },
    {
      id: uuidv4(),
      username: 'alexchen',
      email: 'alex.chen@stanford.edu',
      password: 'password123',
      fullName: 'Alex Chen',
      university: 'Stanford University',
      culturalBackground: 'Chinese',
      interests: ['Computer Science', 'Cultural traditions'],
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Passionate about technology and preserving cultural traditions. Love connecting with fellow students from around the world! 🌍',
      major: 'Computer Science',
      year: 'Junior',
      languages: ['Mandarin', 'English', 'Cantonese'],
      heritage: ['Chinese', 'Taiwanese']
    }
  ],
  groups: [
    {
      name: "South Asian Student Alliance",
      description: "Connecting students from India, Pakistan, Bangladesh, Sri Lanka, and Nepal.",
      category: "South Asian",
      location: "Harvard University",
      isPublic: true,
      image: "https://images.pexels.com/photos/1482691/pexels-photo-1482691.jpeg?auto=compress&cs=tinysrgb&w=400",
      meetingTime: "7:00 PM",
      meetingDate: "Wednesdays",
      meetingLocation: "Cultural Center Room 301",
      meetingDays: ["Wednesday"],
      chatId: "sasa-main-chat",
      presidentIndex: 0 // Aisha Patel
    },
    {
      name: "East Asian Cultural Exchange",
      description: "Promoting Chinese, Japanese, Korean cultural understanding and friendship.",
      category: "East Asian",
      location: "Stanford University",
      isPublic: true,
      universityOnly: true,
      allowedUniversity: "Stanford University",
      image: "https://images.pexels.com/photos/6786961/pexels-photo-6786961.jpeg?auto=compress&cs=tinysrgb&w=400",
      meetingTime: "6:30 PM",
      meetingDate: "Fridays",
      meetingLocation: "Asian Cultural Center",
      meetingDays: ["Friday"],
      presidentIndex: 2 // Wei Chen
    },
    {
      name: "Latino Heritage Network",
      description: "Celebrating Latino culture from Mexico, Central America, South America, and the Caribbean.",
      category: "Hispanic/Latino",
      location: "National Network",
      isPublic: true,
      image: "https://images.pexels.com/photos/4253312/pexels-photo-4253312.jpeg?auto=compress&cs=tinysrgb&w=400",
      meetingTime: "7:30 PM",
      meetingDate: "Tuesdays",
      meetingLocation: "Student Union Room 205",
      meetingDays: ["Tuesday"],
      chatId: "lhn-main-chat",
      presidentIndex: 3 // Maria Rodriguez
    }
  ],
  events: [
    {
      title: "Lunar New Year Festival",
      description: "Welcome the Year of the Snake with traditional lantern making, calligraphy workshops, dumplings, and lion dance performances. Red envelopes with surprises for all attendees!",
      date: "Feb 10, 2024",
      time: "6:00 PM",
      location: "Student Center Ballroom",
      category: ["Chinese", "East Asian", "Vietnamese"],
      organizer: "East Asian Cultural Exchange",
      maxAttendees: 200,
      image: "https://images.pexels.com/photos/6786961/pexels-photo-6786961.jpeg?auto=compress&cs=tinysrgb&w=400",
      price: "$7",
      allowedUniversity: "Stanford University",
      groupIndex: 1, // East Asian Cultural Exchange
      creatorIndex: 2 // Wei Chen
    },
    {
      title: "Diwali Festival of Lights",
      description: "Celebrate the festival of lights with traditional performances, authentic Indian food, rangoli making, and fireworks display. Join us for an evening of joy and cultural celebration!",
      date: "Oct 28, 2024",
      time: "7:00 PM",
      location: "Grand Hall",
      category: ["Indian", "South Asian", "Hindu"],
      organizer: "South Asian Student Alliance",
      maxAttendees: 300,
      image: "https://images.pexels.com/photos/1482691/pexels-photo-1482691.jpeg?auto=compress&cs=tinysrgb&w=400",
      price: "$10",
      allowedUniversity: "Harvard University",
      groupIndex: 0, // South Asian Student Alliance
      creatorIndex: 0 // Aisha Patel
    },
    {
      title: "Latin American Food Festival",
      description: "Experience the diverse flavors of Latin America with authentic dishes from Mexico, Peru, Argentina, Colombia, and more. Live music and dance performances included!",
      date: "Sep 15, 2024",
      time: "6:00 PM",
      location: "Central Plaza",
      category: ["Hispanic", "Latino", "Food"],
      organizer: "Latino Heritage Network",
      maxAttendees: 250,
      image: "https://images.pexels.com/photos/4253312/pexels-photo-4253312.jpeg?auto=compress&cs=tinysrgb&w=400",
      price: "$15",
      groupIndex: 2, // Latino Heritage Network
      creatorIndex: 3 // Maria Rodriguez
    }
  ]
};

// Create users, groups, and events in order
const seedDatabase = async () => {
  try {
    // Create users
    const users = await Promise.all(
      mockData.users.map(async (userData) => {
        // Check if user already exists
        const existingUser = await User.findOne({
          where: { email: userData.email }
        });
        
        if (existingUser) {
          return existingUser;
        }
        
        // Create user
        return await User.create(userData);
      })
    );
    
    // Create groups
    const groups = await Promise.all(
      mockData.groups.map(async (groupData) => {
        const { presidentIndex, ...groupDetails } = groupData;
        
        // Create group
        const group = await Group.create({
          ...groupDetails,
          presidentId: users[presidentIndex].id
        });
        
        // Add president as member and admin
        await group.addMember(users[presidentIndex]);
        await group.addAdmin(users[presidentIndex]);
        
        // Add some other users as members
        for (let i = 0; i < users.length; i++) {
          if (i !== presidentIndex && Math.random() > 0.3) {
            await group.addMember(users[i]);
          }
        }
        
        return group;
      })
    );
    
    // Create events
    const events = await Promise.all(
      mockData.events.map(async (eventData) => {
        const { groupIndex, creatorIndex, ...eventDetails } = eventData;
        
        // Create event
        const event = await Event.create({
          ...eventDetails,
          groupId: groups[groupIndex].id,
          creatorId: users[creatorIndex].id,
          status: 'approved' // Set as approved for seed data
        });
        
        // Add some users as attendees
        for (let i = 0; i < users.length; i++) {
          if (Math.random() > 0.4) {
            await event.addAttendee(users[i]);
          }
        }
        
        // Add some users as favorites
        for (let i = 0; i < users.length; i++) {
          if (Math.random() > 0.6) {
            await event.addFavoritedBy(users[i]);
          }
        }
        
        return event;
      })
    );
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = { seedDatabase }; 