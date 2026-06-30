require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Club = require('../models/Club');
const Admin = require('../models/Admin');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pict_events';

const clubsData = [
  {
    name: 'ACM Student Chapter',
    logo_url: 'https://ui-avatars.com/api/?name=ACM&background=3b82f6&color=fff&size=128&bold=true',
  },
  {
    name: 'IEEE Student Branch',
    logo_url: 'https://ui-avatars.com/api/?name=IEEE&background=1d4ed8&color=fff&size=128&bold=true',
  },
  {
    name: 'CSI Student Branch',
    logo_url: 'https://ui-avatars.com/api/?name=CSI&background=7c3aed&color=fff&size=128&bold=true',
  },
  {
    name: 'ISTE Student Chapter',
    logo_url: 'https://ui-avatars.com/api/?name=ISTE&background=059669&color=fff&size=128&bold=true',
  },
  {
    name: 'NSS Unit',
    logo_url: 'https://ui-avatars.com/api/?name=NSS&background=dc2626&color=fff&size=128&bold=true',
  },
  {
    name: 'Cultural Club',
    logo_url: 'https://ui-avatars.com/api/?name=CC&background=d97706&color=fff&size=128&bold=true',
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Registration.deleteMany({});
    await Event.deleteMany({});
    await Admin.deleteMany({});
    await Club.deleteMany({});
    console.log('Cleared existing data');

    // Insert clubs
    const clubs = await Club.insertMany(clubsData);
    console.log(`Inserted ${clubs.length} clubs`);

    // Map club names to IDs
    const clubMap = {};
    clubs.forEach((c) => { clubMap[c.name] = c._id; });

    // Insert admins (password: admin123)
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminsData = clubs.map((club) => ({
      username: club.name.toLowerCase().replace(/\s+/g, '_'),
      password: hashedPassword,
      club_id: club._id,
    }));
    const admins = await Admin.insertMany(adminsData);
    console.log(`Inserted ${admins.length} admins`);

    // Update clubs with admin_id
    for (const admin of admins) {
      await Club.findByIdAndUpdate(admin.club_id, { admin_id: admin._id });
    }

    // Insert events (future dates)
    const eventsData = [
      {
        title: 'CodeSprint 2025',
        date: new Date('2025-08-15'),
        location: 'PICT Seminar Hall',
        description: 'A 24-hour competitive programming contest open to all PICT students. Solve algorithmic challenges and win exciting prizes.',
        club_id: clubMap['ACM Student Chapter'],
        image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
      },
      {
        title: 'Web Dev Workshop',
        date: new Date('2025-09-05'),
        location: 'Lab 301, PICT',
        description: 'Hands-on workshop covering React, Node.js, and MongoDB. Build a full-stack app from scratch in one day.',
        club_id: clubMap['ACM Student Chapter'],
        image_url: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800',
      },
      {
        title: 'IEEE Tech Talk: AI in 2025',
        date: new Date('2025-08-22'),
        location: 'PICT Auditorium',
        description: 'Expert panel discussion on the latest advancements in Artificial Intelligence and Machine Learning.',
        club_id: clubMap['IEEE Student Branch'],
        image_url: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800',
      },
      {
        title: 'Robotics Workshop',
        date: new Date('2025-09-18'),
        location: 'Electronics Lab, PICT',
        description: 'Build and program your own robot using Arduino. No prior experience required.',
        club_id: clubMap['IEEE Student Branch'],
        image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
      },
      {
        title: 'CSI Hackathon 2025',
        date: new Date('2025-10-10'),
        location: 'PICT Main Building',
        description: '36-hour hackathon to build innovative solutions for real-world problems. Team size: 2-4 members.',
        club_id: clubMap['CSI Student Branch'],
        image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
      },
      {
        title: 'Cloud Computing Seminar',
        date: new Date('2025-08-30'),
        location: 'Seminar Hall B, PICT',
        description: 'Introduction to AWS, Azure, and GCP. Learn about cloud architecture and deployment strategies.',
        club_id: clubMap['CSI Student Branch'],
        image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
      },
      {
        title: 'ISTE Project Expo',
        date: new Date('2025-11-05'),
        location: 'PICT Ground Floor',
        description: 'Annual project exhibition where students showcase their innovative engineering projects.',
        club_id: clubMap['ISTE Student Chapter'],
        image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
      },
      {
        title: 'Industry Connect 2025',
        date: new Date('2025-09-25'),
        location: 'PICT Conference Room',
        description: 'Networking event connecting students with industry professionals from top tech companies.',
        club_id: clubMap['ISTE Student Chapter'],
        image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
      },
      {
        title: 'Blood Donation Camp',
        date: new Date('2025-08-10'),
        location: 'PICT Campus',
        description: 'Annual blood donation drive organized by NSS. Every drop counts — be a hero today.',
        club_id: clubMap['NSS Unit'],
        image_url: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800',
      },
      {
        title: 'Tree Plantation Drive',
        date: new Date('2025-09-12'),
        location: 'PICT Campus & Surroundings',
        description: 'Join us in planting 500 trees around the campus as part of our green initiative.',
        club_id: clubMap['NSS Unit'],
        image_url: 'https://images.unsplash.com/photo-1542601906897-d4d1f4e3e1e1?w=800',
      },
      {
        title: 'Techno-Cultural Fest 2025',
        date: new Date('2025-12-01'),
        location: 'PICT Auditorium & Grounds',
        description: 'The biggest annual fest at PICT featuring technical events, cultural performances, and competitions.',
        club_id: clubMap['Cultural Club'],
        image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
      },
      {
        title: 'Dance & Music Night',
        date: new Date('2025-10-20'),
        location: 'PICT Open Air Theatre',
        description: 'An evening of dance performances, live music, and cultural showcases by PICT students.',
        club_id: clubMap['Cultural Club'],
        image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
      },
    ];

    const events = await Event.insertMany(eventsData);
    console.log(`Inserted ${events.length} events`);

    // Add tentative dates for clubs that might not have events in a given period
    await Club.findByIdAndUpdate(clubMap['NSS Unit'], {
      $push: {
        tentative_dates: {
          $each: [
            { label: 'Health Awareness Camp', date: new Date('2026-01-15') },
            { label: 'Rural Outreach Program', date: new Date('2026-02-20') },
          ],
        },
      },
    });

    await Club.findByIdAndUpdate(clubMap['Cultural Club'], {
      $push: {
        tentative_dates: {
          $each: [
            { label: 'Annual Day Celebration', date: new Date('2026-03-10') },
          ],
        },
      },
    });

    console.log('Added tentative dates');
    console.log('\n=== Seed completed successfully ===');
    console.log('\nAdmin credentials (password for all: admin123):');
    admins.forEach((a) => console.log(`  Username: ${a.username}`));
    console.log('\nYou can now start the server with: npm run dev');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
