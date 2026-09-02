const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const JobRole = require('./models/JobRole');
const Question = require('./models/Question');
const Interview = require('./models/Interview');

dotenv.config();

const categorizedRoles = [
  {
    category: "Technology / IT",
    roles: [
      "Software Engineer", "Software Developer", "Frontend Developer", "Backend Developer",
      "Full Stack Developer", "React Developer", "Angular Developer", "Vue.js Developer",
      "Node.js Developer", "Java Developer", "Python Developer", "C++ Developer",
      "C# Developer", "PHP Developer", ".NET Developer", "Mobile App Developer",
      "Android Developer", "iOS Developer", "Flutter Developer", "React Native Developer",
      "DevOps Engineer", "Cloud Engineer", "Cloud Architect", "Solutions Architect",
      "System Administrator", "Network Engineer", "Database Administrator",
      "Site Reliability Engineer", "Technical Support Engineer", "IT Support Specialist"
    ]
  },
  {
    category: "Data / AI / ML",
    roles: [
      "Data Analyst", "Data Scientist", "Data Engineer", "Machine Learning Engineer",
      "AI Engineer", "AI Researcher", "NLP Engineer", "Computer Vision Engineer",
      "BI Analyst", "Business Intelligence Developer", "Analytics Engineer"
    ]
  },
  {
    category: "Cybersecurity",
    roles: [
      "Cybersecurity Analyst", "Security Engineer", "Information Security Analyst",
      "Security Consultant", "Penetration Tester", "Ethical Hacker", "SOC Analyst",
      "Security Architect", "Cybersecurity Engineer"
    ]
  },
  {
    category: "QA / Testing",
    roles: [
      "QA Engineer", "QA Analyst", "Software Tester", "Manual Tester",
      "Automation Tester", "Test Engineer", "Performance Tester", "SDET"
    ]
  },
  {
    category: "UI / UX / Design",
    roles: [
      "UI Designer", "UX Designer", "UI/UX Designer", "Product Designer",
      "Graphic Designer", "Web Designer", "Interaction Designer", "Visual Designer",
      "Creative Designer", "Motion Designer", "3D Designer"
    ]
  },
  {
    category: "Product / Project / Management",
    roles: [
      "Product Manager", "Product Owner", "Project Manager", "Program Manager",
      "Technical Project Manager", "Scrum Master", "Delivery Manager",
      "Engineering Manager", "Operations Manager", "General Manager"
    ]
  },
  {
    category: "Business / Consulting",
    roles: [
      "Business Analyst", "Business Consultant", "Management Consultant",
      "Strategy Consultant", "Business Development Manager", "Business Development Executive",
      "Operations Analyst", "Operations Executive", "Process Analyst"
    ]
  },
  {
    category: "Sales",
    roles: [
      "Sales Executive", "Sales Representative", "Sales Manager", "Account Executive",
      "Account Manager", "Territory Sales Manager", "Inside Sales Executive",
      "Field Sales Executive", "Sales Development Representative", "Business Development Representative"
    ]
  },
  {
    category: "Marketing",
    roles: [
      "Marketing Executive", "Marketing Manager", "Digital Marketing Executive",
      "Digital Marketing Manager", "SEO Specialist", "SEO Manager", "SEM Specialist",
      "Content Marketing Specialist", "Content Strategist", "Social Media Executive",
      "Social Media Manager", "Brand Manager", "Growth Marketing Manager", "Email Marketing Specialist"
    ]
  },

  {
    category: "Finance / Accounting",
    roles: [
      "Accountant", "Senior Accountant", "Financial Analyst", "Finance Manager",
      "Investment Analyst", "Investment Banker", "Credit Analyst", "Risk Analyst",
      "Auditor", "Internal Auditor", "Tax Consultant", "Tax Analyst", "Financial Advisor", "Accounts Executive"
    ]
  },
  {
    category: "Banking",
    roles: [
      "Banking Executive", "Relationship Manager", "Branch Manager", "Credit Officer",
      "Loan Officer", "Banking Analyst", "Operations Officer", "Investment Banking Analyst"
    ]
  },
  {
    category: "Healthcare",
    roles: [
      "Doctor", "Medical Officer", "Nurse", "Pharmacist", "Medical Representative",
      "Medical Coder", "Medical Lab Technician", "Healthcare Administrator",
      "Clinical Research Associate", "Healthcare Analyst", "Physiotherapist",
      "Dentist", "Radiologist", "Medical Technologist"
    ]
  },
  {
    category: "Legal",
    roles: [
      "Lawyer", "Legal Associate", "Legal Consultant", "Legal Analyst",
      "Corporate Lawyer", "Compliance Officer", "Legal Advisor", "Paralegal"
    ]
  },
  {
    category: "Education",
    roles: [
      "Teacher", "School Teacher", "College Lecturer", "Professor",
      "Assistant Professor", "Academic Counselor", "Education Consultant",
      "Instructional Designer", "Curriculum Developer", "Training Manager", "Corporate Trainer"
    ]
  },
  {
    category: "Media / Content / Creative",
    roles: [
      "Content Writer", "Technical Writer", "Copywriter", "Editor",
      "Video Editor", "Video Producer", "Content Creator", "Social Media Content Creator",
      "Photographer", "Animator", "Motion Graphics Designer", "Creative Director", "Art Director"
    ]
  },
  {
    category: "Engineering",
    roles: [
      "Mechanical Engineer", "Civil Engineer", "Electrical Engineer",
      "Electronics Engineer", "Electronics and Communication Engineer", "Production Engineer",
      "Manufacturing Engineer", "Industrial Engineer", "Quality Engineer", "Process Engineer",
      "Automotive Engineer", "Chemical Engineer", "Environmental Engineer"
    ]
  },
  {
    category: "Construction / Architecture",
    roles: [
      "Architect", "Interior Designer", "Site Engineer", "Structural Engineer",
      "Construction Manager", "Project Engineer", "Quantity Surveyor", "Planning Engineer", "Civil Site Supervisor"
    ]
  },
  {
    category: "Supply Chain / Logistics",
    roles: [
      "Supply Chain Analyst", "Supply Chain Manager", "Logistics Executive",
      "Logistics Manager", "Procurement Executive", "Procurement Manager",
      "Purchasing Manager", "Warehouse Manager", "Inventory Manager", "Operations Coordinator"
    ]
  },
  {
    category: "Hospitality / Travel",
    roles: [
      "Hotel Manager", "Front Office Executive", "Guest Relations Executive",
      "Restaurant Manager", "Chef", "Sous Chef", "Travel Consultant", "Travel Agent",
      "Event Manager", "Event Coordinator"
    ]
  },
  {
    category: "Science / Research",
    roles: [
      "Research Scientist", "Research Analyst", "Research Associate", "Lab Assistant",
      "Chemist", "Physicist", "Biotechnologist", "Microbiologist", "Environmental Scientist"
    ]
  },
  {
    category: "Customer Service",
    roles: [
      "Customer Service Executive", "Customer Support Executive", "Customer Success Manager",
      "Customer Success Executive", "Call Center Executive", "Technical Support Executive", "Customer Care Executive"
    ]
  },
  {
    category: "Real Estate",
    roles: [
      "Real Estate Agent", "Property Consultant", "Real Estate Manager", "Property Manager", "Real Estate Analyst"
    ]
  },
  {
    category: "Retail",
    roles: [
      "Retail Executive", "Store Manager", "Retail Manager", "Merchandiser", "Sales Associate", "Store Supervisor"
    ]
  },
  {
    category: "Freelance / Startup / Other",
    roles: [
      "Freelancer", "Consultant", "Entrepreneur", "Founder", "Co-Founder",
      "Intern", "Graduate Trainee", "Management Trainee", "Apprentice", "Other"
    ]
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_interview_db';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing predefined Job Roles
    await JobRole.deleteMany({});
    
    // Seed All Categorized Roles
    const roleDocs = [];
    categorizedRoles.forEach(catGroup => {
      catGroup.roles.forEach(roleName => {
        roleDocs.push({
          roleName: roleName,
          name: roleName,
          category: catGroup.category,
          isPredefined: true,
          isActive: true
        });
      });
    });

    await JobRole.insertMany(roleDocs);
    console.log(`Seeded ${roleDocs.length} job roles across ${categorizedRoles.length} categories.`);

    // Seed Default Users (Safe Upsert - Do NOT delete existing registered users)
    const salt = await bcrypt.genSalt(10);
    const studentPassword = await bcrypt.hash('student123', salt);

    if (!(await User.findOne({ email: 'student@aiinterview.com' }))) {
      await User.create({
        name: 'Alex Student',
        email: 'student@aiinterview.com',
        password: studentPassword,
        role: 'STUDENT',
        studentId: 'STU-2026-00001',
        profile: { targetRoles: ['Frontend Developer', 'Sales Executive'] }
      });
    }

    console.log('Default Seed Users verified.');

    // Seed Questions
    await Question.deleteMany({});
    const defaultQuestions = [
      {
        question: "Tell me about yourself and your background relevant to this job role.",
        category: "Technical",
        jobRole: "Frontend Developer",
        difficulty: "Beginner",
        type: "Text",
        source: "System",
        evaluationCriteria: ["Communication", "Relevance", "Clarity"]
      },
      {
        question: "What is customer relationship management and how do you build trust with new clients?",
        category: "Non-Technical",
        jobRole: "Sales Executive",
        difficulty: "Beginner",
        type: "Text",
        source: "System",
        evaluationCriteria: ["Customer Handling", "Persuasion", "Communication"]
      },
      {
        question: "How would you handle a customer who says your product or service is too expensive?",
        category: "Non-Technical",
        jobRole: "Sales Executive",
        difficulty: "Intermediate",
        type: "Video",
        source: "System",
        evaluationCriteria: ["Objection Handling", "Negotiation", "Problem Solving"]
      },
      {
        question: "Explain the difference between SQL and NoSQL databases and when to use each.",
        category: "Technical",
        jobRole: "Backend Developer",
        difficulty: "Intermediate",
        type: "Text",
        source: "System",
        evaluationCriteria: ["Technical Knowledge", "Accuracy", "Logical Thinking"]
      },
      {
        question: "How do you evaluate financial statements to determine a company's financial health?",
        category: "Non-Technical",
        jobRole: "Financial Analyst",
        difficulty: "Intermediate",
        type: "Text",
        source: "System",
        evaluationCriteria: ["Financial Knowledge", "Analytical Thinking", "Numerical Reasoning"]
      }
    ];
    await Question.insertMany(defaultQuestions);
    console.log('Seeded Question Bank.');

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedDB();
