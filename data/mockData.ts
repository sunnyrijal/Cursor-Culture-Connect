// project/data/mockData.ts

import { User } from '../types/user';
import { Group, SocialMedia, Media } from '../types/group';
import { Event } from '../types/event';

export interface MockUser extends User {}
export interface MockEvent extends Event {}
export interface MockGroup extends Group {}

export interface Conversation {
    id: string;
    user: MockUser;
    messages: Message[];
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}

export interface GroupConversation {
    id: string; // This will match the group's chatId
    group: MockGroup;
    messages: Message[];
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}

export interface Message {
    id: string;
    text: string;
    sender: 'me' | string; // 'me' or user id
    senderName?: string; 
    senderImage?: string;
    timestamp: string;
}

export const mockEvents: MockEvent[] = [
    { 
        id: 1, 
        name: "Lunar New Year Festival", 
        description: "Welcome the Year of the Snake with traditional lantern making, calligraphy workshops, dumplings, and lion dance performances. Red envelopes with surprises for all attendees!", 
        isRSVPed: true, 
        isFavorited: true, 
        image: 'https://images.pexels.com/photos/6786961/pexels-photo-6786961.jpeg?auto=compress&cs=tinysrgb&w=400', 
        date: 'Feb 10, 2024', 
        time: '6:00 PM', 
        location: 'Student Center Ballroom', 
        category: ["Chinese", "East Asian", "Vietnamese"], 
        organizer: "Chinese Students & Scholars Association", 
        attendees: 156, 
        maxAttendees: 200, 
        price: "$7", 
        distance: "0.2 miles", 
        allowedUniversity: 'Stanford University' 
    },
    { 
        id: 2, 
        name: "Diwali Festival of Lights", 
        description: "Celebrate the festival of lights with traditional performances, authentic Indian food, rangoli making, and fireworks display. Join us for an evening of joy and cultural celebration!", 
        isRSVPed: true, 
        isFavorited: false, 
        image: 'https://images.pexels.com/photos/1482691/pexels-photo-1482691.jpeg?auto=compress&cs=tinysrgb&w=400', 
        date: 'Oct 28, 2024', 
        time: '7:00 PM', 
        location: 'Grand Hall', 
        category: ["Indian", "South Asian", "Hindu"], 
        organizer: "Indian Students Association", 
        attendees: 245, 
        maxAttendees: 300, 
        price: "$10", 
        distance: "0.1 miles", 
        allowedUniversity: 'Harvard University' 
    },
    // New: Sports, music, and general campus events
    {
        id: 3,
        name: "Campus Soccer Game Night",
        description: "Join us for a friendly soccer match under the lights! All skill levels welcome. Snacks and drinks provided.",
        isRSVPed: false,
        isFavorited: false,
        image: 'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg?auto=compress&cs=tinysrgb&w=400',
        date: 'Mar 5, 2024',
        time: '8:00 PM',
        location: 'Main Sports Field',
        category: ["Sports", "Games"],
        organizer: "Campus Recreation",
        attendees: 40,
        maxAttendees: 100,
        price: "Free",
        distance: "0.3 miles",
    },
    {
        id: 4,
        name: "Open Mic Music Jam",
        description: "Show off your musical talent or just enjoy the vibes! All genres and instruments welcome. Free pizza for performers.",
        isRSVPed: false,
        isFavorited: false,
        image: 'https://images.pexels.com/photos/164936/pexels-photo-164936.jpeg?auto=compress&cs=tinysrgb&w=400',
        date: 'Mar 10, 2024',
        time: '7:00 PM',
        location: 'Student Union Cafe',
        category: ["Music", "Open Mic"],
        organizer: "Student Activities Board",
        attendees: 60,
        maxAttendees: 120,
        price: "Free",
        distance: "0.1 miles",
    },
    {
        id: 5,
        name: "Career Fair for International Students",
        description: "Meet recruiters from top companies and learn about job opportunities for international students. Resume reviews and networking!",
        isRSVPed: false,
        isFavorited: false,
        image: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=400',
        date: 'Mar 15, 2024',
        time: '2:00 PM',
        location: 'Career Center',
        category: ["Career", "International"],
        organizer: "Career Services",
        attendees: 120,
        maxAttendees: 300,
        price: "Free",
        distance: "0.2 miles",
    },
    {
        id: 6,
        name: "Mental Health & Wellness Workshop",
        description: "A supportive space to learn about mental health resources, stress management, and self-care. Open to all students.",
        isRSVPed: false,
        isFavorited: false,
        image: 'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=400',
        date: 'Mar 20, 2024',
        time: '5:00 PM',
        location: 'Wellness Center',
        category: ["Wellness", "Workshop"],
        organizer: "Student Health Services",
        attendees: 30,
        maxAttendees: 50,
        price: "Free",
        distance: "0.1 miles",
    },
    {
        id: 7,
        name: "Board Game Social Night",
        description: "Meet new friends and play classic and modern board games. Snacks provided. All are welcome!",
        isRSVPed: false,
        isFavorited: false,
        image: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=400',
        date: 'Mar 22, 2024',
        time: '6:00 PM',
        location: 'Community Lounge',
        category: ["Games", "Social"],
        organizer: "Campus Life",
        attendees: 25,
        maxAttendees: 60,
        price: "Free",
        distance: "0.2 miles",
    },
];

const sasaSocials: SocialMedia[] = [
  { platform: 'instagram', link: 'https://instagram.com/sasa_university' },
  { platform: 'facebook', link: 'https://facebook.com/sasa_university' },
];

const sasaMedia: Media[] = [
  { type: 'image', url: 'https://placehold.co/400x400/A78BFA/FFFFFF?text=Diwali+23' },
  { type: 'image', url: 'https://placehold.co/400x400/7C3AED/FFFFFF?text=Holi+24' },
  { type: 'image', url: 'https://placehold.co/400x400/6D28D9/FFFFFF?text=Cultural+Fair' },
  { type: 'image', url: 'https://placehold.co/400x400/5B21B6/FFFFFF?text=Food+Festival' },
  { type: 'image', url: 'https://placehold.co/400x400/4C1D95/FFFFFF?text=Dance+Practice' },
];

const lhnSocials: SocialMedia[] = [
  { platform: 'instagram', link: 'https://instagram.com/latino_heritage_network' },
  { platform: 'facebook', link: 'https://facebook.com/latino_heritage_network' },
  { platform: 'twitter', link: 'https://twitter.com/latino_heritage' },
];

const lhnMedia: Media[] = [
  { type: 'image', url: 'https://placehold.co/400x400/F59E0B/FFFFFF?text=Dia+de+Muertos' },
  { type: 'image', url: 'https://placehold.co/400x400/D97706/FFFFFF?text=Cinco+de+Mayo' },
  { type: 'image', url: 'https://placehold.co/400x400/B45309/FFFFFF?text=Salsa+Night' },
  { type: 'image', url: 'https://placehold.co/400x400/92400E/FFFFFF?text=Food+Festival' },
];

export const mockGroups: MockGroup[] = [
    { 
        id: 1, 
        name: "South Asian Student Alliance", 
        description: "Connecting students from India, Pakistan, Bangladesh, Sri Lanka, and Nepal.", 
        isJoined: true, 
        image: 'https://images.pexels.com/photos/1482691/pexels-photo-1482691.jpeg?auto=compress&cs=tinysrgb&w=400', 
        memberCount: 156, 
        location: 'Harvard University', 
        category: 'South Asian', 
        recentActivity: '2 hours ago', 
        upcomingEvents: 4, 
        isPublic: true, 
        meetingTime: "7:00 PM", 
        meetingDate: "Wednesdays", 
        meetingLocation: "Cultural Center Room 301",
        meetingDays: ["Wednesday"],
        presidentId: '1', 
        officerIds: ['3'],
        chatId: 'sasa-main-chat',
        socialMedia: sasaSocials,
        media: sasaMedia,
        pastEvents: [2]
    },
    { 
        id: 2, 
        name: "East Asian Cultural Exchange", 
        description: "Promoting Chinese, Japanese, Korean cultural understanding and friendship.", 
        memberCount: 89, 
        category: "East Asian", 
        location: "Stanford University", 
        isPublic: true, 
        isJoined: false, 
        recentActivity: "5 hours ago", 
        image: "https://images.pexels.com/photos/6786961/pexels-photo-6786961.jpeg?auto=compress&cs=tinysrgb&w=400", 
        upcomingEvents: 2, 
        universityOnly: true, 
        allowedUniversity: "Stanford University", 
        meetingTime: "6:30 PM",
        meetingDate: "Fridays",
        meetingLocation: "Asian Cultural Center",
        meetingDays: ["Friday"],
        presidentId: '11',
        pastEvents: [1]
    },
    { 
        id: 3, 
        name: "Latino Heritage Network", 
        description: "Celebrating Latino culture from Mexico, Central America, South America, and the Caribbean.", 
        isJoined: true, 
        image: 'https://images.pexels.com/photos/4253312/pexels-photo-4253312.jpeg?auto=compress&cs=tinysrgb&w=400', 
        memberCount: 134, 
        location: 'National Network', 
        category: 'Hispanic/Latino', 
        recentActivity: '1 day ago', 
        upcomingEvents: 3, 
        isPublic: true,
        meetingTime: "7:30 PM",
        meetingDate: "Tuesdays",
        meetingLocation: "Student Union Room 205",
        meetingDays: ["Tuesday"],
        presidentId: '16',
        chatId: 'lhn-main-chat',
        socialMedia: lhnSocials,
        media: lhnMedia,
        pastEvents: [2]
    },
    { 
        id: 4, 
        name: "African American Student Union", 
        description: "Empowering African American students through cultural events, mentorship, and community building.", 
        memberCount: 203, 
        category: "African American", 
        location: "MIT", 
        isPublic: true, 
        isJoined: false, 
        recentActivity: "3 hours ago", 
        image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400", 
        upcomingEvents: 5, 
        meetingTime: "6:00 PM",
        meetingDate: "Thursdays",
        meetingLocation: "Student Center Room 102",
        meetingDays: ["Thursday"],
        presidentId: '21'
    },
    { 
        id: 5, 
        name: "Middle Eastern Cultural Society", 
        description: "Celebrating the rich diversity of Middle Eastern cultures, traditions, and contemporary issues.", 
        memberCount: 67, 
        category: "Middle Eastern", 
        location: "Columbia University", 
        isPublic: false, 
        isJoined: false, 
        recentActivity: "1 day ago", 
        image: "https://images.pexels.com/photos/1482691/pexels-photo-1482691.jpeg?auto=compress&cs=tinysrgb&w=400", 
        upcomingEvents: 2, 
        meetingTime: "7:00 PM",
        meetingDate: "Mondays",
        meetingLocation: "International House",
        meetingDays: ["Monday"],
        presidentId: '25'
    },
    { 
        id: 6, 
        name: "European Cultural Club", 
        description: "Exploring the diverse cultures of Europe through food, music, art, and cultural exchange.", 
        memberCount: 98, 
        category: "European", 
        location: "Yale University", 
        isPublic: true, 
        isJoined: false, 
        recentActivity: "4 hours ago", 
        image: "https://images.pexels.com/photos/1482691/pexels-photo-1482691.jpeg?auto=compress&cs=tinysrgb&w=400", 
        upcomingEvents: 3, 
        meetingTime: "6:30 PM",
        meetingDate: "Wednesdays",
        meetingLocation: "European Studies Center",
        meetingDays: ["Wednesday"],
        presidentId: '30'
    },
    { 
        id: 7, 
        name: "Pacific Islander Association", 
        description: "Honoring Pacific Islander heritage through traditional practices, storytelling, and community events.", 
        memberCount: 45, 
        category: "Pacific Islander", 
        location: "University of California, Berkeley", 
        isPublic: true, 
        isJoined: false, 
        recentActivity: "2 days ago", 
        image: "https://images.pexels.com/photos/1482691/pexels-photo-1482691.jpeg?auto=compress&cs=tinysrgb&w=400", 
        upcomingEvents: 1, 
        meetingTime: "5:30 PM",
        meetingDate: "Fridays",
        meetingLocation: "Multicultural Center",
        meetingDays: ["Friday"],
        presidentId: '35'
    },
    { 
        id: 8, 
        name: "Native American Student Circle", 
        description: "Preserving and celebrating Native American traditions, languages, and contemporary issues.", 
        memberCount: 34, 
        category: "Native American", 
        location: "University of Michigan", 
        isPublic: false, 
        isJoined: false, 
        recentActivity: "1 week ago", 
        image: "https://images.pexels.com/photos/1482691/pexels-photo-1482691.jpeg?auto=compress&cs=tinysrgb&w=400", 
        upcomingEvents: 2, 
        meetingTime: "7:00 PM",
        meetingDate: "Tuesdays",
        meetingLocation: "Native American Cultural Center",
        meetingDays: ["Tuesday"],
        presidentId: '40'
    },
    { 
        id: 9, 
        name: "International Students Network", 
        description: "Supporting international students through cultural exchange, language practice, and friendship.", 
        memberCount: 312, 
        category: "International", 
        location: "Stanford University", 
        isPublic: true, 
        isJoined: false, 
        recentActivity: "1 hour ago", 
        image: "https://images.pexels.com/photos/1482691/pexels-photo-1482691.jpeg?auto=compress&cs=tinysrgb&w=400", 
        upcomingEvents: 6, 
        meetingTime: "6:00 PM",
        meetingDate: "Sundays",
        meetingLocation: "International Center",
        meetingDays: ["Sunday"],
        presidentId: '45'
    },
    { 
        id: 10, 
        name: "Mixed Heritage Collective", 
        description: "Creating space for students with mixed cultural backgrounds to explore and celebrate their diverse identities.", 
        memberCount: 78, 
        category: "Mixed Heritage", 
        location: "Harvard University", 
        isPublic: true, 
        isJoined: false, 
        recentActivity: "5 hours ago", 
        image: "https://images.pexels.com/photos/1482691/pexels-photo-1482691.jpeg?auto=compress&cs=tinysrgb&w=400", 
        upcomingEvents: 3, 
        meetingTime: "7:00 PM",
        meetingDate: "Saturdays",
        meetingLocation: "Diversity Center",
        meetingDays: ["Saturday"],
        presidentId: '50'
    }
];

export const mockUsersByHeritage: Record<string, MockUser[]> = {
  'South Asian': [
    { 
        id: '1', 
        name: 'Aisha Patel', 
        email: 'aisha.patel@harvard.edu',
        university: 'Harvard University', 
        major: 'Medicine', 
        year: 'Graduate', 
        title: 'Medical Student at Harvard', 
        heritage: ['Indian', 'South Asian'], 
        languages: ['Hindi', 'Gujarati', 'English'], 
        bio: 'Med student passionate about health equity and Bollywood dancing! 💃', 
        image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=400', 
        verified: true, 
        mutualConnections: 8, 
        location: 'Cambridge, MA', 
        country: 'United States', 
        state: 'Massachusetts', 
        isConnected: true, 
        isPublic: true, 
        groupsList: [mockGroups[0]] 
    },
    { 
        id: '3', 
        name: 'Priya Gupta', 
        email: 'priya.gupta@oxford.ac.uk',
        university: 'Oxford University', 
        major: 'Business Administration', 
        year: 'Junior', 
        title: 'Business Student | Oxford', 
        heritage: ['Indian', 'South Asian'], 
        languages: ['Hindi', 'English', 'Punjabi'], 
        bio: 'Business student passionate about sustainable entrepreneurship and Indian culture! 🌱', 
        image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400', 
        verified: true, 
        mutualConnections: 6, 
        location: 'Oxford, UK', 
        country: 'United Kingdom', 
        isConnected: false, 
        isPublic: true 
    },
  ],
  'East Asian': [
     { 
        id: '11', 
        name: 'Wei Chen', 
        email: 'wei.chen@tsinghua.edu.cn',
        university: 'Tsinghua University', 
        major: 'Computer Science', 
        year: 'Senior', 
        title: 'AI Researcher | Tsinghua University', 
        heritage: ['Chinese', 'East Asian'], 
        languages: ['Mandarin', 'English'], 
        bio: 'CS student passionate about AI and machine learning research.', 
        image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400', 
        verified: true, 
        mutualConnections: 7, 
        location: 'Beijing, China', 
        country: 'China', 
        isConnected: true, 
        isPublic: true 
    },
  ],
  'Hispanic/Latino': [
     { 
        id: '16', 
        name: 'Maria Rodriguez', 
        email: 'maria.rodriguez@harvard.edu',
        university: 'Harvard University', 
        major: 'International Business', 
        year: 'Senior', 
        title: 'Student at Harvard Business School', 
        heritage: ['Mexican', 'Hispanic/Latino'], 
        languages: ['Spanish', 'English'], 
        bio: 'Passionate about bridging cultures through business and food!', 
        image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400', 
        verified: true, 
        mutualConnections: 3, 
        location: 'Cambridge, MA', 
        country: 'United States', 
        isConnected: true, 
        isPublic: true 
    },
  ],
};

const allMockUsers = Object.values(mockUsersByHeritage).flat();
const connectionsList = allMockUsers.filter(u => u.isConnected && u.id !== 'current_user_alex_chen');

// Dynamically assign connectionsList to Aisha Patel
const aishaUser = mockUsersByHeritage['South Asian'].find(u => u.id === '1');
if (aishaUser) {
    aishaUser.connectionsList = connectionsList.filter(u => u.id !== '1');
}

export const currentUser: MockUser = {
  id: 'current_user_alex_chen',
  name: 'Alex Chen',
  email: 'alex.chen@stanford.edu',
  university: 'Stanford University',
  major: 'Computer Science',
  year: 'Junior',
  title: 'Computer Science Student',
  heritage: ['Chinese', 'Taiwanese'],
  languages: ['Mandarin', 'English', 'Cantonese'],
  bio: 'Passionate about technology and preserving cultural traditions. Love connecting with fellow students from around the world! 🌍',
  image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
  verified: true,
  eventsAttended: mockEvents.filter(e => e.isRSVPed).length,
  joinedGroups: mockGroups.filter(g => g.isJoined).length,
  connections: connectionsList.length,
  groupsList: mockGroups.filter(g => g.isJoined),
  connectionsList: connectionsList,
  location: 'Palo Alto, CA',
  country: 'United States',
  state: 'California',
  isPublic: true,
};

export const findUserById = (id?: string | string[]): MockUser | null => {
  if (!id) return null;
  const userId = Array.isArray(id) ? id[0] : id;
  return allMockUsers.find(u => u.id === userId) || null;
}

export const mockConversations: Conversation[] = [
    {
        id: '1',
        user: findUserById('1')!,
        messages: [ 
            { id: 'msg1', text: "Hey! Saw we're both in the South Asian Student Alliance. Looking forward to the next event!", sender: '1', timestamp: '10:30 AM' }, 
            { id: 'msg2', text: "Awesome! Me too. Should be a great time.", sender: 'me', timestamp: '10:32 AM' }, 
        ],
        lastMessage: "Awesome! Me too. Should be a great time.",
        lastMessageTime: '10:32 AM',
        unreadCount: 0,
    },
    {
        id: '16',
        user: findUserById('16')!,
        messages: [ 
            { id: 'msg3', text: "That was a great talk on international business yesterday!", sender: '16', timestamp: 'Yesterday' }, 
        ],
        lastMessage: "That was a great talk on international business yesterday!",
        lastMessageTime: 'Yesterday',
        unreadCount: 1,
    }
];

export const mockGroupConversations: GroupConversation[] = [
    {
        id: 'sasa-main-chat',
        group: mockGroups[0],
        messages: [
            { id: 'gc_msg1', text: "Hey everyone! Just a reminder about our meeting this Wednesday at 7.", sender: '1', senderName: 'Aisha Patel', senderImage: findUserById('1')?.image, timestamp: '9:15 AM' },
            { id: 'gc_msg2', text: "Thanks for the reminder, Aisha! I'll be there.", sender: '3', senderName: 'Priya Gupta', senderImage: findUserById('3')?.image, timestamp: '9:18 AM' },
            { id: 'gc_msg3', text: "I'm bringing samosas! 🎉", sender: 'me', senderName: 'Alex Chen', senderImage: currentUser.image, timestamp: '9:25 AM' },
        ],
        lastMessage: "I'm bringing samosas! 🎉",
        lastMessageTime: '9:25 AM',
        unreadCount: 3,
    }
];
