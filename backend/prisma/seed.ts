import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.savedCollege.deleteMany({});
  await prisma.savedComparison.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.facility.deleteMany({});
  await prisma.placement.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.college.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding database...');

  // Create mock users for writing reviews
  const passwordHash = await bcrypt.hash('password123', 12);
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'aarav@example.com',
        name: 'Aarav Sharma',
        passwordHash,
        phone: '9876543210',
        examType: 'JEE Main',
        targetYear: 2026,
      },
    }),
    prisma.user.create({
      data: {
        email: 'ananya@example.com',
        name: 'Ananya Iyer',
        passwordHash,
        phone: '9876543211',
        examType: 'CAT',
        targetYear: 2027,
      },
    }),
    prisma.user.create({
      data: {
        email: 'rohan@example.com',
        name: 'Rohan Verma',
        passwordHash,
        phone: '9876543212',
        examType: 'NEET',
        targetYear: 2026,
      },
    }),
    prisma.user.create({
      data: {
        email: 'priya@example.com',
        name: 'Priya Nair',
        passwordHash,
        phone: '9876543213',
        examType: 'CLAT',
        targetYear: 2028,
      },
    }),
    prisma.user.create({
      data: {
        email: 'amit@example.com',
        name: 'Amit Gupta',
        passwordHash,
        phone: '9876543214',
        examType: 'Direct',
        targetYear: 2026,
      },
    }),
  ]);

  // High-quality free unsplash images for campus banners
  const campusImages = [
    'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800', // college main
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800', // building
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800', // campus lawn
    'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&q=80&w=800', // library
    'https://images.unsplash.com/photo-1527891751199-7225231a68dd?auto=format&fit=crop&q=80&w=800', // modern courtyard
  ];

  // Helper to generate dynamic SVG logos
  const getLogo = (name: string, bg: string = '1A56A0') => {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 3).toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${bg}&color=fff&size=128&font-size=0.4&bold=true`;
  };

  const collegesData: any[] = [
    // ENGINEERING COLLEGES
    {
      name: 'Indian Institute of Technology, Bombay (IITB)',
      locationCity: 'Mumbai',
      locationState: 'Maharashtra',
      feesMin: 220000,
      feesMax: 250000,
      established: 1958,
      naacGrade: 'A++',
      nirfRank: 3,
      ownership: 'Government',
      type: 'Autonomous',
      about: 'Established in 1958, IIT Bombay is a global leader in engineering education and research. Located in Powai on a beautiful 550-acre campus surrounded by lakes and hills, it offers a vibrant academic culture, cutting-edge labs, and world-renowned faculty.',
      campusSize: 550,
      studentCount: 12000,
      facultyCount: 700,
      affiliatedUniversity: 'Autonomous',
      regulatoryBody: 'AICTE',
      logoUrl: getLogo('IIT Bombay', '1E3A8A'),
      bannerUrl: campusImages[0],
      stream: 'Engineering',
      courses: [
        { name: 'B.Tech Computer Science & Engineering', level: 'UG', duration: '4 Years', seats: 120, fees: 230000, eligibility: '10+2 with 75% in PCM + JEE Advanced Rank', admissionMode: 'JEE Advanced' },
        { name: 'B.Tech Electrical Engineering', level: 'UG', duration: '4 Years', seats: 100, fees: 230000, eligibility: '10+2 with 75% in PCM + JEE Advanced Rank', admissionMode: 'JEE Advanced' },
        { name: 'B.Tech Mechanical Engineering', level: 'UG', duration: '4 Years', seats: 110, fees: 230000, eligibility: '10+2 with 75% in PCM + JEE Advanced Rank', admissionMode: 'JEE Advanced' },
        { name: 'M.Tech Microelectronics & VLSI', level: 'PG', duration: '2 Years', seats: 30, fees: 120000, eligibility: 'B.Tech in ECE/EE + GATE Qualified', admissionMode: 'GATE' },
        { name: 'M.Tech Computer Science', level: 'PG', duration: '2 Years', seats: 45, fees: 120000, eligibility: 'B.Tech in CSE/IT + GATE Qualified', admissionMode: 'GATE' }
      ],
      placements: [
        { year: 2025, avgPackage: 23.5, highestPackage: 168.0, medianPackage: 19.8, placementPercentage: 91.5, recruitersJson: JSON.stringify(['Google', 'Microsoft', 'Qualcomm', 'Apple', 'Tower Research', 'Rubrik', 'Intel']) },
        { year: 2024, avgPackage: 21.8, highestPackage: 154.0, medianPackage: 18.2, placementPercentage: 89.0, recruitersJson: JSON.stringify(['Google', 'Microsoft', 'Qualcomm', 'Apple', 'Meta', 'Rubrik']) },
        { year: 2023, avgPackage: 22.5, highestPackage: 180.0, medianPackage: 19.0, placementPercentage: 94.0, recruitersJson: JSON.stringify(['Google', 'Microsoft', 'Uber', 'Apple', 'Goldman Sachs']) }
      ],
      facilities: { library: true, hostel: true, sports: true, labs: true, wifi: true, cafeteria: true, gym: true, medical: true },
      reviews: [
        { rating: 4.8, academicsRating: 4.9, facultyRating: 4.8, placementsRating: 5.0, infrastructureRating: 4.5, socialLifeRating: 4.8, title: 'Incredible coding culture and best campus life', body: 'IIT Bombay has the finest coding culture in the country. The facilities are excellent, especially the student clubs like DevClub. Hostel hostels can be a bit old, but the food options in campus (including Nescafe and private eateries) make up for it.', userIdOffset: 0 },
        { rating: 4.6, academicsRating: 4.7, facultyRating: 4.6, placementsRating: 4.8, infrastructureRating: 4.2, socialLifeRating: 4.7, title: 'Academic rigour with unmatched exposure', body: 'The coursework is extremely rigorous, but the placement opportunities are second to none. Top tier firms visit on Day 1. Campus life is lively with Mood Indigo, Asia’s largest cultural festival.', userIdOffset: 4 }
      ]
    },
    {
      name: 'Indian Institute of Technology, Delhi (IITD)',
      locationCity: 'New Delhi',
      locationState: 'Delhi',
      feesMin: 220000,
      feesMax: 245000,
      established: 1961,
      naacGrade: 'A++',
      nirfRank: 2,
      ownership: 'Government',
      type: 'Autonomous',
      about: 'IIT Delhi, located in the heart of India’s capital, is a premier institution for technology, engineering, and research. With active tie-ups with global institutions, IIT Delhi focuses on entrepreneurship and innovation, boasting a large ecosystem of student-run startups.',
      campusSize: 320,
      studentCount: 11000,
      facultyCount: 650,
      affiliatedUniversity: 'Autonomous',
      regulatoryBody: 'AICTE',
      logoUrl: getLogo('IIT Delhi', '10B981'),
      bannerUrl: campusImages[1],
      stream: 'Engineering',
      courses: [
        { name: 'B.Tech Computer Science & Engineering', level: 'UG', duration: '4 Years', seats: 105, fees: 225000, eligibility: '10+2 with 75% in PCM + JEE Advanced Rank', admissionMode: 'JEE Advanced' },
        { name: 'B.Tech Mathematics & Computing', level: 'UG', duration: '4 Years', seats: 80, fees: 225000, eligibility: '10+2 with 75% in PCM + JEE Advanced Rank', admissionMode: 'JEE Advanced' },
        { name: 'B.Tech Chemical Engineering', level: 'UG', duration: '4 Years', seats: 90, fees: 225000, eligibility: '10+2 with 75% in PCM + JEE Advanced Rank', admissionMode: 'JEE Advanced' },
        { name: 'M.Tech VLSI Design Tools', level: 'PG', duration: '2 Years', seats: 25, fees: 115000, eligibility: 'B.Tech ECE/EE + GATE Score', admissionMode: 'GATE' }
      ],
      placements: [
        { year: 2025, avgPackage: 22.8, highestPackage: 150.0, medianPackage: 18.5, placementPercentage: 90.0, recruitersJson: JSON.stringify(['Google', 'Microsoft', 'NVIDIA', 'Cohesity', 'Jane Street', 'Texas Instruments']) },
        { year: 2024, avgPackage: 21.5, highestPackage: 140.0, medianPackage: 17.5, placementPercentage: 88.5, recruitersJson: JSON.stringify(['Google', 'Microsoft', 'Rubrik', 'Sprinklr', 'Intel', 'Optiver']) }
      ],
      facilities: { library: true, hostel: true, sports: true, labs: true, wifi: true, cafeteria: true, gym: true, medical: true },
      reviews: [
        { rating: 4.7, academicsRating: 4.8, facultyRating: 4.5, placementsRating: 4.9, infrastructureRating: 4.6, socialLifeRating: 4.7, title: 'Startup hub and incredible networking', body: 'IIT Delhi is a hotbed for startups. The student alumni network in Gurgaon and Delhi is extremely supportive. Labs are top notch, and the library is open 24/7 during exams.', userIdOffset: 0 }
      ]
    },
    {
      name: 'Indian Institute of Technology, Madras (IITM)',
      locationCity: 'Chennai',
      locationState: 'Tamil Nadu',
      feesMin: 215000,
      feesMax: 240000,
      established: 1959,
      naacGrade: 'A++',
      nirfRank: 1,
      ownership: 'Government',
      type: 'Autonomous',
      about: 'Ranked No. 1 by NIRF for several consecutive years, IIT Madras is celebrated for its sprawling forest-like campus, pioneering research park, and highly customized curriculum that allows students to choose up to 50% of their courses as electives.',
      campusSize: 630,
      studentCount: 11500,
      facultyCount: 680,
      affiliatedUniversity: 'Autonomous',
      regulatoryBody: 'AICTE',
      logoUrl: getLogo('IIT Madras', 'F59E0B'),
      bannerUrl: campusImages[2],
      stream: 'Engineering',
      courses: [
        { name: 'B.Tech Computer Science & Engineering', level: 'UG', duration: '4 Years', seats: 110, fees: 220000, eligibility: '10+2 with 75% in PCM + JEE Advanced Rank', admissionMode: 'JEE Advanced' },
        { name: 'B.Tech Aerospace Engineering', level: 'UG', duration: '4 Years', seats: 60, fees: 220000, eligibility: '10+2 with 75% in PCM + JEE Advanced Rank', admissionMode: 'JEE Advanced' },
        { name: 'B.Tech Engineering Physics', level: 'UG', duration: '4 Years', seats: 45, fees: 220000, eligibility: '10+2 with 75% in PCM + JEE Advanced Rank', admissionMode: 'JEE Advanced' }
      ],
      placements: [
        { year: 2025, avgPackage: 24.2, highestPackage: 172.0, medianPackage: 20.2, placementPercentage: 92.0, recruitersJson: JSON.stringify(['Google', 'Jane Street', 'Rubrik', 'Microsoft', 'NVIDIA', 'Honeywell', 'Samsung']) }
      ],
      facilities: { library: true, hostel: true, sports: true, labs: true, wifi: true, cafeteria: true, gym: true, medical: true },
      reviews: [
        { rating: 4.9, academicsRating: 5.0, facultyRating: 4.8, placementsRating: 5.0, infrastructureRating: 4.8, socialLifeRating: 4.6, title: 'Number One for a reason!', body: 'Stunning campus with deer and monkeys. The research park offers incredible internship opportunities. Flexibility in choosing courses makes academic stress manageable.', userIdOffset: 0 }
      ]
    },
    {
      name: 'BITS Pilani (Pilani Campus)',
      locationCity: 'Pilani',
      locationState: 'Rajasthan',
      feesMin: 480000,
      feesMax: 540000,
      established: 1964,
      naacGrade: 'A',
      nirfRank: 25,
      ownership: 'Private',
      type: 'Deemed',
      about: 'BITS Pilani is India’s premier private engineering institute. Famously known for its strict zero-attendance policy, its unique Practice School (PS) industry internship model, and a stellar startup culture backed by the BITSian alumni network.',
      campusSize: 328,
      studentCount: 5500,
      facultyCount: 380,
      affiliatedUniversity: 'Deemed University',
      regulatoryBody: 'UGC',
      logoUrl: getLogo('BITS Pilani', '4F46E5'),
      bannerUrl: campusImages[3],
      stream: 'Engineering',
      courses: [
        { name: 'B.E. Computer Science', level: 'UG', duration: '4 Years', seats: 120, fees: 510000, eligibility: '10+2 with 75% aggregate in PCM + BITSAT cutoff', admissionMode: 'BITSAT' },
        { name: 'B.E. Electronics & Communication', level: 'UG', duration: '4 Years', seats: 100, fees: 510000, eligibility: '10+2 with 75% aggregate in PCM + BITSAT cutoff', admissionMode: 'BITSAT' },
        { name: 'B.E. Chemical Engineering', level: 'UG', duration: '4 Years', seats: 80, fees: 510000, eligibility: '10+2 with 75% aggregate in PCM + BITSAT cutoff', admissionMode: 'BITSAT' },
        { name: 'M.Sc. Physics (Dual Degree)', level: 'UG', duration: '5 Years', seats: 60, fees: 510000, eligibility: '10+2 with 75% aggregate in PCM + BITSAT cutoff', admissionMode: 'BITSAT' }
      ],
      placements: [
        { year: 2025, avgPackage: 20.5, highestPackage: 98.0, medianPackage: 17.5, placementPercentage: 89.5, recruitersJson: JSON.stringify(['Google', 'Microsoft', 'Salesforce', 'Amazon', 'Adobe', 'PwC', 'JPMorgan']) },
        { year: 2024, avgPackage: 19.2, highestPackage: 84.0, medianPackage: 16.0, placementPercentage: 87.0, recruitersJson: JSON.stringify(['Microsoft', 'Amazon', 'Oracle', 'JPMorgan Chase', 'Uber']) }
      ],
      facilities: { library: true, hostel: true, sports: true, labs: true, wifi: true, cafeteria: true, gym: true, medical: true },
      reviews: [
        { rating: 4.6, academicsRating: 4.5, facultyRating: 4.4, placementsRating: 4.8, infrastructureRating: 4.7, socialLifeRating: 4.9, title: 'Freedom to choose and learn', body: 'The zero attendance policy gives you enough time to pursue software development, competitive programming or start your own venture. The Practice School system guarantees 6 months of corporate internship.', userIdOffset: 1 }
      ]
    },
    {
      name: 'National Institute of Technology, Tiruchirappalli (NIT Trichy)',
      locationCity: 'Tiruchirappalli',
      locationState: 'Tamil Nadu',
      feesMin: 140000,
      feesMax: 155000,
      established: 1964,
      naacGrade: 'A',
      nirfRank: 9,
      ownership: 'Government',
      type: 'Autonomous',
      about: 'NIT Trichy is consistently ranked as the top NIT in India. It is known for its excellent academic programs, sprawling campus, and great placements. The student community runs Pragyan (techno-managerial fest) and Festember (cultural fest).',
      campusSize: 800,
      studentCount: 6500,
      facultyCount: 400,
      affiliatedUniversity: 'Autonomous',
      regulatoryBody: 'AICTE',
      logoUrl: getLogo('NIT Trichy', 'EF4444'),
      bannerUrl: campusImages[4],
      stream: 'Engineering',
      courses: [
        { name: 'B.Tech Computer Science & Engineering', level: 'UG', duration: '4 Years', seats: 110, fees: 145000, eligibility: '10+2 with 75% in PCM + JEE Main Rank', admissionMode: 'JEE Main' },
        { name: 'B.Tech Electrical & Electronics Engineering', level: 'UG', duration: '4 Years', seats: 100, fees: 145000, eligibility: '10+2 with 75% in PCM + JEE Main Rank', admissionMode: 'JEE Main' }
      ],
      placements: [
        { year: 2025, avgPackage: 15.8, highestPackage: 64.0, medianPackage: 13.5, placementPercentage: 88.0, recruitersJson: JSON.stringify(['Microsoft', 'Amazon', 'Samsung', 'L&T', 'Qualcomm', 'Citi', 'Deloitte']) }
      ],
      facilities: { library: true, hostel: true, sports: true, labs: true, wifi: true, cafeteria: true, gym: true, medical: true },
      reviews: [
        { rating: 4.4, academicsRating: 4.3, facultyRating: 4.1, placementsRating: 4.6, infrastructureRating: 4.2, socialLifeRating: 4.5, title: 'Outstanding placements and green campus', body: 'The hostels are massive, and food is decent. Placements in CS/ECE/EEE are comparable to mid-tier IITs. Pragyan is an amazing experience.', userIdOffset: 0 }
      ]
    },

    // MBA COLLEGES
    {
      name: 'Indian Institute of Management, Ahmedabad (IIMA)',
      locationCity: 'Ahmedabad',
      locationState: 'Gujarat',
      feesMin: 1200000,
      feesMax: 1300000,
      established: 1961,
      naacGrade: 'A++',
      nirfRank: 1,
      ownership: 'Government',
      type: 'Autonomous',
      about: 'IIM Ahmedabad is the undisputed gold standard of management education in India. Renowned for its Louis Kahn-designed brick campus, the case study teaching method, and generating top corporate leaders globally.',
      campusSize: 106,
      studentCount: 1000,
      facultyCount: 110,
      affiliatedUniversity: 'Autonomous',
      regulatoryBody: 'AICTE',
      logoUrl: getLogo('IIM Ahmedabad', '9061F2'),
      bannerUrl: campusImages[1],
      stream: 'MBA',
      courses: [
        { name: 'Post Graduate Programme in Management (PGP)', level: 'PG', duration: '2 Years', seats: 395, fees: 1250000, eligibility: 'Bachelor’s degree with 50% + CAT cutoff', admissionMode: 'CAT' },
        { name: 'Post Graduate Programme in Food & Agri-Business (PGP-FABM)', level: 'PG', duration: '2 Years', seats: 50, fees: 1150000, eligibility: 'Bachelor’s degree in Agri-sciences + CAT', admissionMode: 'CAT' }
      ],
      placements: [
        { year: 2025, avgPackage: 34.5, highestPackage: 115.0, medianPackage: 31.0, placementPercentage: 100.0, recruitersJson: JSON.stringify(['McKinsey & Co', 'BCG', 'Bain & Co', 'Goldman Sachs', 'HUL', 'TAS', 'Microsoft']) },
        { year: 2024, avgPackage: 32.8, highestPackage: 108.0, medianPackage: 30.0, placementPercentage: 100.0, recruitersJson: JSON.stringify(['McKinsey', 'BCG', 'Morgan Stanley', 'Bain', 'Adani Group', 'Tata']) }
      ],
      facilities: { library: true, hostel: true, sports: true, labs: true, wifi: true, cafeteria: true, gym: true, medical: true },
      reviews: [
        { rating: 4.9, academicsRating: 5.0, facultyRating: 5.0, placementsRating: 5.0, infrastructureRating: 4.8, socialLifeRating: 4.4, title: 'Life-changing experience but highly stressful', body: 'The case method triggers intense discussions. You will hardly sleep during the first year, but the learnings, brand value, and network are worth every second.', userIdOffset: 1 }
      ]
    },
    {
      name: 'Indian Institute of Management, Bangalore (IIMB)',
      locationCity: 'Bengaluru',
      locationState: 'Karnataka',
      feesMin: 1200000,
      feesMax: 1250000,
      established: 1973,
      naacGrade: 'A++',
      nirfRank: 2,
      ownership: 'Government',
      type: 'Autonomous',
      about: 'Set in India’s Silicon Valley, IIM Bangalore is famous for its beautiful stone architecture green campus, its focus on tech/analytics consulting, and strong corporate tie-ups with multinational firms.',
      campusSize: 100,
      studentCount: 1200,
      facultyCount: 120,
      affiliatedUniversity: 'Autonomous',
      regulatoryBody: 'AICTE',
      logoUrl: getLogo('IIM Bangalore', '3B82F6'),
      bannerUrl: campusImages[2],
      stream: 'MBA',
      courses: [
        { name: 'Post Graduate Programme in Management (PGP)', level: 'PG', duration: '2 Years', seats: 410, fees: 1225000, eligibility: 'Bachelor’s degree with 50% + CAT cutoff', admissionMode: 'CAT' },
        { name: 'PGP in Business Analytics (PGP-BA)', level: 'PG', duration: '2 Years', seats: 60, fees: 1225000, eligibility: 'Bachelor’s degree + CAT cutoff', admissionMode: 'CAT' }
      ],
      placements: [
        { year: 2025, avgPackage: 33.2, highestPackage: 102.0, medianPackage: 30.2, placementPercentage: 100.0, recruitersJson: JSON.stringify(['McKinsey', 'Bain', 'BCG', 'Microsoft', 'Accenture Strategy', 'Amazon', 'Kearney']) }
      ],
      facilities: { library: true, hostel: true, sports: true, labs: true, wifi: true, cafeteria: true, gym: true, medical: true },
      reviews: [
        { rating: 4.8, academicsRating: 4.9, facultyRating: 4.8, placementsRating: 5.0, infrastructureRating: 4.9, socialLifeRating: 4.5, title: 'Incredible tech ecosystem and campus vibes', body: 'The stone buildings are iconic. Strong concentration of consulting and product management roles. Culturally, the campus is vibrant and open.', userIdOffset: 1 }
      ]
    },

    // MEDICAL COLLEGES
    {
      name: 'All India Institute of Medical Sciences, Delhi (AIIMS)',
      locationCity: 'New Delhi',
      locationState: 'Delhi',
      feesMin: 1500,
      feesMax: 2000,
      established: 1956,
      naacGrade: 'A++',
      nirfRank: 1,
      ownership: 'Government',
      type: 'Autonomous',
      about: 'AIIMS New Delhi is India’s apex medical institution. It offers world-class medical education at a cost heavily subsidized by the government, alongside massive clinical exposure via its public hospital, treating millions of patients annually.',
      campusSize: 115,
      studentCount: 1500,
      facultyCount: 350,
      affiliatedUniversity: 'Autonomous',
      regulatoryBody: 'MCI',
      logoUrl: getLogo('AIIMS Delhi', '10B981'),
      bannerUrl: campusImages[3],
      stream: 'Medical',
      courses: [
        { name: 'Bachelor of Medicine and Bachelor of Surgery (MBBS)', level: 'UG', duration: '5.5 Years', seats: 125, fees: 1628, eligibility: '10+2 with 60% in PCB + NEET UG Rank', admissionMode: 'NEET UG' },
        { name: 'MD General Medicine', level: 'PG', duration: '3 Years', seats: 40, fees: 2000, eligibility: 'MBBS + INI CET score', admissionMode: 'INI CET' }
      ],
      placements: [
        { year: 2025, avgPackage: 18.0, highestPackage: 35.0, medianPackage: 16.5, placementPercentage: 98.0, recruitersJson: JSON.stringify(['Max Healthcare', 'Fortis', 'Apollo Hospitals', 'Medanta', 'Government Residency']) }
      ],
      facilities: { library: true, hostel: true, sports: true, labs: true, wifi: true, cafeteria: true, gym: true, medical: true },
      reviews: [
        { rating: 4.9, academicsRating: 5.0, facultyRating: 4.9, placementsRating: 4.8, infrastructureRating: 4.7, socialLifeRating: 4.5, title: 'Unparalleled clinical exposure', body: 'The absolute best medical college. The sheer variety of cases you see here is unmatched. Tuition fees are less than 2000 rupees for the entire MBBS program. Highly recommended.', userIdOffset: 2 }
      ]
    },

    // LAW COLLEGES
    {
      name: 'National Law School of India University (NLSIU)',
      locationCity: 'Bengaluru',
      locationState: 'Karnataka',
      feesMin: 250000,
      feesMax: 275000,
      established: 1987,
      naacGrade: 'A++',
      nirfRank: 1,
      ownership: 'Government',
      type: 'Autonomous',
      about: 'Established in 1987, NLSIU Bangalore was the first National Law University established in India. It is widely considered the Harvard of law schools in India, offering elite legal training and placing students in top domestic and international law firms.',
      campusSize: 23,
      studentCount: 800,
      facultyCount: 60,
      affiliatedUniversity: 'Autonomous',
      regulatoryBody: 'BCI',
      logoUrl: getLogo('NLSIU Bangalore', 'D97706'),
      bannerUrl: campusImages[4],
      stream: 'Law',
      courses: [
        { name: 'B.A. LL.B. (Hons)', level: 'UG', duration: '5 Years', seats: 240, fees: 260000, eligibility: '10+2 with 45% + CLAT cutoff', admissionMode: 'CLAT' },
        { name: 'LL.M.', level: 'PG', duration: '1 Year', seats: 100, fees: 220000, eligibility: 'LL.B. degree with 50% + CLAT PG', admissionMode: 'CLAT PG' }
      ],
      placements: [
        { year: 2025, avgPackage: 16.5, highestPackage: 28.0, medianPackage: 15.0, placementPercentage: 96.0, recruitersJson: JSON.stringify(['Amarchand Mangaldas', 'Trilegal', 'AZB & Partners', 'Khaitan & Co', 'Luthra & Luthra', 'Linklaters']) }
      ],
      facilities: { library: true, hostel: true, sports: true, labs: false, wifi: true, cafeteria: true, gym: true, medical: true },
      reviews: [
        { rating: 4.7, academicsRating: 4.8, facultyRating: 4.7, placementsRating: 4.9, infrastructureRating: 4.3, socialLifeRating: 4.5, title: 'Strict academic calendar but incredible placements', body: 'The trimester system is extremely fast and demanding. Research assignments are tough. However, the placement record is 100% for corporate batches. The library has excellent database access.', userIdOffset: 3 }
      ]
    },
    {
      name: 'Sharda University',
      locationCity: 'Greater Noida',
      locationState: 'Uttar Pradesh',
      feesMin: 180000,
      feesMax: 320000,
      established: 2009,
      naacGrade: 'A+',
      nirfRank: 87,
      ownership: 'Private',
      type: 'Autonomous',
      about: 'Sharda University is a leading private multidisciplinary university in Greater Noida, known for its diverse student body and modern infrastructure. It offers a global quality education with research-oriented coursework across multiple streams.',
      campusSize: 63,
      studentCount: 13000,
      facultyCount: 900,
      affiliatedUniversity: 'Autonomous',
      regulatoryBody: 'UGC',
      logoUrl: getLogo('Sharda University', '059669'),
      bannerUrl: campusImages[0],
      stream: 'Engineering',
      courses: [
        { name: 'B.Tech Computer Science & Engineering', level: 'UG', duration: '4 Years', seats: 240, fees: 220000, eligibility: '10+2 with 60% in PCM + SUAT/JEE Rank', admissionMode: 'JEE Main' },
        { name: 'MBA Marketing', level: 'PG', duration: '2 Years', seats: 120, fees: 300000, eligibility: 'Graduation with 50% + CAT/MAT', admissionMode: 'CAT' }
      ],
      placements: [
        { year: 2025, avgPackage: 6.2, highestPackage: 45.0, medianPackage: 5.5, placementPercentage: 88.0, recruitersJson: JSON.stringify(['Wipro', 'TCS', 'Cognizant', 'HDFC Bank', 'Amazon', 'Tech Mahindra']) }
      ],
      facilities: { library: true, hostel: true, sports: true, labs: true, wifi: true, cafeteria: true, gym: true, medical: true },
      reviews: [
        { rating: 4.2, academicsRating: 4.0, facultyRating: 4.1, placementsRating: 4.3, infrastructureRating: 4.5, socialLifeRating: 4.4, title: 'Amazing campus life and diverse student culture', body: 'The infrastructure of Sharda University is top class. Hostels are comfortable and the student community is highly diverse with many international students. Placements are solid for CS.', userIdOffset: 2 }
      ]
    },
    {
      name: 'Galgotias University',
      locationCity: 'Greater Noida',
      locationState: 'Uttar Pradesh',
      feesMin: 149000,
      feesMax: 159000,
      established: 2011,
      naacGrade: 'A+',
      nirfRank: 101,
      ownership: 'Private',
      type: 'Autonomous',
      about: 'Galgotias University is a premier private university in Greater Noida, celebrated for its high placement rates, modern coding curriculum, and state-of-the-art laboratory facilities.',
      campusSize: 52,
      studentCount: 15000,
      facultyCount: 800,
      affiliatedUniversity: 'Autonomous',
      regulatoryBody: 'UGC',
      logoUrl: getLogo('Galgotias University', '2563EB'),
      bannerUrl: campusImages[2],
      stream: 'Engineering',
      courses: [
        { name: 'B.Tech Computer Science & Engineering', level: 'UG', duration: '4 Years', seats: 360, fees: 159000, eligibility: '10+2 with 60% in PCM + JEE/GUAT', admissionMode: 'JEE Main' }
      ],
      placements: [
        { year: 2025, avgPackage: 5.8, highestPackage: 35.0, medianPackage: 5.0, placementPercentage: 92.0, recruitersJson: JSON.stringify(['Infosys', 'TCS', 'Cognizant', 'Ericsson', 'Wipro']) }
      ],
      facilities: { library: true, hostel: true, sports: true, labs: true, wifi: true, cafeteria: true, gym: true, medical: true },
      reviews: [
        { rating: 4.1, academicsRating: 4.0, facultyRating: 3.9, placementsRating: 4.4, infrastructureRating: 4.2, socialLifeRating: 4.3, title: 'Excellent placement cell and coding culture', body: 'The placement cell is very active and brings many companies to the campus. Coding culture is growing and labs are modern. Campus is quite lively.', userIdOffset: 1 }
      ]
    },
    {
      name: 'Birla Institute of Management Technology (BIMTECH)',
      locationCity: 'Greater Noida',
      locationState: 'Uttar Pradesh',
      feesMin: 600000,
      feesMax: 700000,
      established: 1988,
      naacGrade: 'A+',
      nirfRank: 48,
      ownership: 'Private',
      type: 'Deemed',
      about: 'BIMTECH is a highly respected private business school in Greater Noida. Established in 1988 under the aegis of the Birla Group, it is renowned for its PGDM programs, high academic rigor, and exceptional placement records with top multinational firms.',
      campusSize: 10,
      studentCount: 800,
      facultyCount: 75,
      affiliatedUniversity: 'AICTE Approved',
      regulatoryBody: 'AICTE',
      logoUrl: getLogo('BIMTECH Noida', 'B91C1C'),
      bannerUrl: campusImages[1],
      stream: 'MBA',
      courses: [
        { name: 'PGDM General', level: 'PG', duration: '2 Years', seats: 240, fees: 650000, eligibility: 'Graduation with 50% + CAT/XAT/GMAT', admissionMode: 'CAT' },
        { name: 'PGDM International Business', level: 'PG', duration: '2 Years', seats: 60, fees: 650000, eligibility: 'Graduation with 50% + CAT/XAT/GMAT', admissionMode: 'CAT' }
      ],
      placements: [
        { year: 2025, avgPackage: 11.2, highestPackage: 24.4, medianPackage: 10.5, placementPercentage: 100.0, recruitersJson: JSON.stringify(['Deloitte', 'EY', 'KPMG', 'PwC', 'Infosys', 'ICICI Bank', 'Wipro']) }
      ],
      facilities: { library: true, hostel: true, sports: true, labs: true, wifi: true, cafeteria: true, gym: true, medical: true },
      reviews: [
        { rating: 4.4, academicsRating: 4.5, facultyRating: 4.4, placementsRating: 4.5, infrastructureRating: 4.3, socialLifeRating: 4.2, title: 'Superb management training with 100% placements', body: 'BIMTECH offers a rigorous management program. The faculty is highly experienced and coming from industry. Big 4 consulting and top private banks are regular recruiters.', userIdOffset: 3 }
      ]
    }
  ];

  // Let's generate remaining 41 colleges programmatically to reach 50+ total
  const citiesStates = [
    { city: 'Chennai', state: 'Tamil Nadu' },
    { city: 'Kolkata', state: 'West Bengal' },
    { city: 'Pune', state: 'Maharashtra' },
    { city: 'New Delhi', state: 'Delhi' },
    { city: 'Hyderabad', state: 'Telangana' },
    { city: 'Bengaluru', state: 'Karnataka' },
    { city: 'Noida', state: 'Uttar Pradesh' },
    { city: 'Ahmedabad', state: 'Gujarat' },
    { city: 'Jaipur', state: 'Rajasthan' },
    { city: 'Coimbatore', state: 'Tamil Nadu' }
  ];

  const streams = ['Engineering', 'Medical', 'MBA', 'Law', 'Arts', 'Science'];

  for (let i = 1; i <= 42; i++) {
    const stream = streams[i % streams.length];
    const loc = citiesStates[i % citiesStates.length];
    const established = 1960 + (i * 3) % 60;
    const rating = parseFloat((3.8 + (i * 0.08) % 1.2).toFixed(1));
    const nirfRank = 10 + i;
    const ownership = i % 3 === 0 ? 'Private' : 'Government';
    const type = i % 2 === 0 ? 'Autonomous' : 'Affiliated';
    const naacGrade = ['A++', 'A+', 'A', 'B++', 'B+'][i % 5];
    const name = `${ownership === 'Government' ? 'Government' : 'Apex'} College of ${stream} ${i} (${ownership === 'Government' ? 'GC' : 'AC'}${stream[0]}${i})`;
    const feesMin = stream === 'MBA' ? 300000 + i * 15000 : stream === 'Medical' ? 100000 + i * 50000 : 80000 + i * 5000;
    const feesMax = feesMin * (1.2 + (i * 0.02) % 0.4);

    let courses: any[] = [];
    if (stream === 'Engineering') {
      courses = [
        { name: 'B.Tech Computer Science', level: 'UG', duration: '4 Years', seats: 60, fees: feesMin, eligibility: '10+2 with 60% in PCM', admissionMode: 'JEE Main' },
        { name: 'B.Tech Mechanical Engineering', level: 'UG', duration: '4 Years', seats: 60, fees: feesMin * 0.9, eligibility: '10+2 with 60% in PCM', admissionMode: 'JEE Main' },
        { name: 'M.Tech Software Engineering', level: 'PG', duration: '2 Years', seats: 18, fees: feesMin * 0.7, eligibility: 'B.Tech in CSE/IT', admissionMode: 'GATE' }
      ];
    } else if (stream === 'Medical') {
      courses = [
        { name: 'MBBS', level: 'UG', duration: '5.5 Years', seats: 100, fees: feesMin, eligibility: '10+2 with 50% in PCB + NEET', admissionMode: 'NEET' },
        { name: 'B.Sc Nursing', level: 'UG', duration: '4 Years', seats: 40, fees: feesMin * 0.3, eligibility: '10+2 with Science', admissionMode: 'Merit' }
      ];
    } else if (stream === 'MBA') {
      courses = [
        { name: 'MBA General', level: 'PG', duration: '2 Years', seats: 120, fees: feesMin, eligibility: 'Graduation with 50%', admissionMode: 'CAT/MAT' },
        { name: 'MBA Finance', level: 'PG', duration: '2 Years', seats: 60, fees: feesMin * 1.1, eligibility: 'Graduation with 50%', admissionMode: 'CAT/MAT' }
      ];
    } else if (stream === 'Law') {
      courses = [
        { name: 'BA LL.B', level: 'UG', duration: '5 Years', seats: 120, fees: feesMin, eligibility: '10+2 with 45%', admissionMode: 'CLAT/LSAT' },
        { name: 'LL.B', level: 'UG', duration: '3 Years', seats: 60, fees: feesMin * 0.8, eligibility: 'Graduation', admissionMode: 'Merit' }
      ];
    } else {
      // Arts / Science
      courses = [
        { name: `B.Sc ${i % 2 === 0 ? 'Physics' : 'Chemistry'}`, level: 'UG', duration: '3 Years', seats: 50, fees: feesMin, eligibility: '10+2 with Science', admissionMode: 'Merit' },
        { name: `BA ${i % 2 === 0 ? 'English' : 'Economics'}`, level: 'UG', duration: '3 Years', seats: 60, fees: feesMin * 0.8, eligibility: '10+2', admissionMode: 'Merit' }
      ];
    }

    const placements = [
      {
        year: 2025,
        avgPackage: parseFloat((4.5 + (i * 0.3) % 8).toFixed(1)),
        highestPackage: parseFloat((10.0 + (i * 1.5) % 25).toFixed(1)),
        medianPackage: parseFloat((4.0 + (i * 0.25) % 7).toFixed(1)),
        placementPercentage: parseFloat((70.0 + (i * 0.6) % 25).toFixed(1)),
        recruitersJson: JSON.stringify(['Infosys', 'TCS', 'Wipro', 'Cognizant', 'HDFC Bank', 'ICICI Bank'])
      },
      {
        year: 2024,
        avgPackage: parseFloat((4.2 + (i * 0.28) % 7.5).toFixed(1)),
        highestPackage: parseFloat((9.0 + (i * 1.3) % 22).toFixed(1)),
        medianPackage: parseFloat((3.8 + (i * 0.22) % 6.5).toFixed(1)),
        placementPercentage: parseFloat((68.0 + (i * 0.55) % 25).toFixed(1)),
        recruitersJson: JSON.stringify(['Infosys', 'TCS', 'Capgemini', 'Cognizant', 'HDFC Bank'])
      }
    ];

    const facilities = {
      library: i % 2 === 0,
      hostel: i % 3 !== 0,
      sports: i % 2 !== 0,
      labs: stream === 'Engineering' || stream === 'Medical' || stream === 'Science',
      wifi: i % 4 !== 0,
      cafeteria: true,
      gym: i % 5 === 0,
      medical: i % 3 === 0
    };

    const reviewTexts = [
      { title: 'Decent experience with good placements', body: 'The college has fine classrooms and the labs are well equipped. Placements are quite good for CS students. Faculty members are generally supportive, though some can be strict.' },
      { title: 'Good infrastructure but average mess food', body: 'The hostel rooms are clean and the campus is clean. Sports grounds are huge. The main drawback is the hostel mess food, which gets repetitive. Academic workload is medium.' },
      { title: 'Excellent value for money and exposure', body: 'Given the low government fee, the ROI is amazing. Library resources are vast. Lots of student cultural clubs and technical fests happen throughout the year.' }
    ];

    const reviews = [
      {
        rating: rating,
        academicsRating: Math.min(5, rating + 0.1),
        facultyRating: Math.min(5, rating - 0.2),
        placementsRating: Math.min(5, rating + 0.2),
        infrastructureRating: Math.min(5, rating - 0.1),
        socialLifeRating: Math.min(5, rating),
        title: reviewTexts[i % reviewTexts.length].title,
        body: reviewTexts[i % reviewTexts.length].body,
        userIdOffset: i % users.length
      }
    ];

    collegesData.push({
      name,
      locationCity: loc.city,
      locationState: loc.state,
      feesMin,
      feesMax,
      established,
      naacGrade,
      nirfRank,
      ownership,
      type,
      about: `Established in ${established}, ${name} is located in ${loc.city}, ${loc.state}. It is a prominent ${ownership.toLowerCase()} institute dedicated to high quality training and skill building in the field of ${stream.toLowerCase()} studies.`,
      campusSize: parseFloat((10 + i * 2.5).toFixed(1)),
      studentCount: 800 + i * 150,
      facultyCount: 50 + i * 8,
      affiliatedUniversity: type === 'Affiliated' ? 'State University' : 'Autonomous',
      regulatoryBody: stream === 'Engineering' ? 'AICTE' : stream === 'Medical' ? 'MCI' : stream === 'Law' ? 'BCI' : 'UGC',
      logoUrl: getLogo(name, i % 2 === 0 ? '1A56A0' : '10B981'),
      bannerUrl: campusImages[i % campusImages.length],
      stream,
      courses,
      placements,
      facilities,
      reviews
    });
  }

  // Insert records sequentially to maintain relational links
  for (const c of collegesData) {
    const college = await prisma.college.create({
      data: {
        name: c.name,
        logoUrl: c.logoUrl,
        bannerUrl: c.bannerUrl,
        locationCity: c.locationCity,
        locationState: c.locationState,
        feesMin: c.feesMin,
        feesMax: c.feesMax,
        rating: c.rating || (c.reviews && c.reviews.length > 0 ? parseFloat((c.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / c.reviews.length).toFixed(1)) : 0.0),
        established: c.established,
        naacGrade: c.naacGrade,
        nirfRank: c.nirfRank,
        ownership: c.ownership,
        type: c.type,
        about: c.about,
        campusSize: c.campusSize,
        studentCount: c.studentCount,
        facultyCount: c.facultyCount,
        affiliatedUniversity: c.affiliatedUniversity,
        regulatoryBody: c.regulatoryBody,
        mapEmbedUrl: `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3500!2d77!3d28!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDAwJzAwLjAiTiA3N8KwMDAnMDAuMCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin`
      }
    });

    // Create courses
    for (const cr of c.courses) {
      await prisma.course.create({
        data: {
          collegeId: college.id,
          name: cr.name,
          level: cr.level,
          duration: cr.duration,
          seats: cr.seats,
          fees: cr.fees,
          eligibility: cr.eligibility,
          admissionMode: cr.admissionMode
        }
      });
    }

    // Create placements
    for (const pl of c.placements) {
      await prisma.placement.create({
        data: {
          collegeId: college.id,
          year: pl.year,
          avgPackage: pl.avgPackage,
          highestPackage: pl.highestPackage,
          medianPackage: pl.medianPackage,
          placementPercentage: pl.placementPercentage,
          recruitersJson: pl.recruitersJson
        }
      });
    }

    // Create facilities
    await prisma.facility.create({
      data: {
        collegeId: college.id,
        library: c.facilities.library,
        hostel: c.facilities.hostel,
        sports: c.facilities.sports,
        labs: c.facilities.labs,
        wifi: c.facilities.wifi,
        cafeteria: c.facilities.cafeteria,
        gym: c.facilities.gym,
        medical: c.facilities.medical
      }
    });

    // Create reviews
    for (const rv of c.reviews) {
      const user = users[rv.userIdOffset];
      await prisma.review.create({
        data: {
          collegeId: college.id,
          userId: user.id,
          rating: rv.rating,
          academicsRating: rv.academicsRating,
          facultyRating: rv.facultyRating,
          placementsRating: rv.placementsRating,
          infrastructureRating: rv.infrastructureRating,
          socialLifeRating: rv.socialLifeRating,
          title: rv.title,
          body: rv.body,
          helpfulCount: Math.floor(Math.random() * 15)
        }
      });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
