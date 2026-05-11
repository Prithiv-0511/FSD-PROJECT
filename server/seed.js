// Seed script: creates a demo organization with admin + employee + departments + sample announcements
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Organization = require('./models/Organization');
const User = require('./models/User');
const Department = require('./models/Department');
const Announcement = require('./models/Announcement');
const Notification = require('./models/Notification');

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  // Clear existing data
  await Promise.all([
    Organization.deleteMany({}),
    User.deleteMany({}),
    Department.deleteMany({}),
    Announcement.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  // Create organization
  const org = await Organization.create({
    name: 'Acme Corporation',
    industry: 'technology',
    plan: 'pro',
  });
  console.log(`✅ Organization: ${org.name} (${org.slug})`);

  // Create admin
  const admin = await User.create({
    firstName: 'John',
    lastName: 'Admin',
    email: 'admin@acme.com',
    password: 'admin123',
    role: 'admin',
    organizationId: org._id,
  });
  console.log(`✅ Admin: admin@acme.com / admin123`);

  // Create departments
  const depts = await Department.insertMany([
    { name: 'Engineering', description: 'Software development team', color: '#6366f1', organizationId: org._id },
    { name: 'Human Resources', description: 'People operations', color: '#22c55e', organizationId: org._id },
    { name: 'Marketing', description: 'Brand and growth', color: '#f59e0b', organizationId: org._id },
    { name: 'Finance', description: 'Financial operations', color: '#ef4444', organizationId: org._id },
  ]);
  console.log(`✅ Departments: ${depts.map(d => d.name).join(', ')}`);

  // Create employee
  const employee = await User.create({
    firstName: 'Jane',
    lastName: 'Employee',
    email: 'employee@acme.com',
    password: 'employee123',
    role: 'employee',
    organizationId: org._id,
    departmentId: depts[0]._id,
  });
  console.log(`✅ Employee: employee@acme.com / employee123`);

  // Create sample announcements
  const now = new Date();
  const futureDate = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const pastDate = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const announcements = await Announcement.insertMany([
    {
      title: 'Q2 Company All-Hands Meeting',
      content: '<h2>Join us for our quarterly review!</h2><p>We will be discussing our Q2 performance, upcoming product launches, and company goals for the remainder of the year.</p><ul><li>Revenue growth and milestones</li><li>New product roadmap</li><li>Team expansion plans</li><li>Q&A with leadership</li></ul><p><strong>Date:</strong> May 15, 2026 at 2:00 PM</p>',
      summary: 'Quarterly all-hands meeting covering Q2 performance, product roadmap, and team expansion.',
      priority: 'urgent',
      status: 'active',
      isPublished: true,
      authorId: admin._id,
      organizationId: org._id,
      departmentIds: [],
      publishAt: now,
      expiresAt: futureDate(30),
      viewCount: 245,
      category: 'events',
    },
    {
      title: 'Updated Health Insurance Benefits Package',
      content: '<h2>New Benefits for 2026</h2><p>We are excited to announce our updated health insurance benefits package. Key improvements include:</p><ol><li>Extended dental coverage</li><li>Mental health support program</li><li>Increased gym reimbursement ($100/month)</li><li>Family coverage options</li></ol><p>Please review the full policy document and reach out to HR with any questions.</p>',
      summary: 'Updated 2026 health insurance package with dental, mental health, and gym benefits.',
      priority: 'normal',
      status: 'active',
      isPublished: true,
      authorId: admin._id,
      organizationId: org._id,
      departmentIds: [depts[1]._id],
      publishAt: pastDate(2),
      expiresAt: futureDate(60),
      viewCount: 180,
      category: 'hr',
    },
    {
      title: 'Engineering Sprint Planning - New Deployment Pipeline',
      content: '<h2>CI/CD Pipeline Upgrade</h2><p>We are migrating to a new CI/CD pipeline using GitHub Actions. This will improve our deployment speed by 3x.</p><p><strong>Training Session:</strong> May 20th at 10 AM</p><p>All engineers are expected to attend.</p>',
      summary: 'Migration to new CI/CD pipeline with 3x faster deployments. Training on May 20th.',
      priority: 'normal',
      status: 'active',
      isPublished: true,
      authorId: admin._id,
      organizationId: org._id,
      departmentIds: [depts[0]._id],
      publishAt: pastDate(1),
      expiresAt: futureDate(14),
      viewCount: 92,
      category: 'engineering',
    },
    {
      title: 'Office Closure Notice - National Holiday',
      content: '<p>Please note that the office will be closed on May 26th for the national holiday. Regular operations will resume on May 27th.</p><p>If you have urgent tasks, please coordinate with your manager before the holiday.</p>',
      summary: 'Office closed May 26th for national holiday. Resume May 27th.',
      priority: 'low',
      status: 'active',
      isPublished: true,
      authorId: admin._id,
      organizationId: org._id,
      departmentIds: [],
      publishAt: pastDate(3),
      expiresAt: futureDate(25),
      viewCount: 312,
      category: 'general',
    },
    {
      title: 'Annual Performance Reviews Schedule',
      content: '<h2>Performance Review Cycle 2026</h2><p>Annual performance reviews will begin next month. Please prepare your self-assessments and goal summaries.</p>',
      summary: 'Annual performance reviews starting next month.',
      priority: 'normal',
      status: 'scheduled',
      isPublished: true,
      authorId: admin._id,
      organizationId: org._id,
      departmentIds: [depts[1]._id],
      publishAt: futureDate(7),
      expiresAt: futureDate(45),
      viewCount: 0,
      category: 'hr',
    },
    {
      title: 'Expired: Previous Quarter Report',
      content: '<p>This is last quarter\'s financial report summary.</p>',
      summary: 'Last quarter financial report.',
      priority: 'low',
      status: 'expired',
      isPublished: false,
      authorId: admin._id,
      organizationId: org._id,
      departmentIds: [depts[3]._id],
      publishAt: pastDate(90),
      expiresAt: pastDate(1),
      viewCount: 450,
      category: 'finance',
    },
  ]);
  console.log(`✅ Announcements: ${announcements.length} created`);

  // Create notifications for employee
  await Notification.insertMany([
    { userId: employee._id, announcementId: announcements[0]._id, title: 'New: Q2 Company All-Hands Meeting', message: 'Quarterly all-hands meeting covering Q2 performance.', type: 'in_app', status: 'sent', sentAt: now },
    { userId: employee._id, announcementId: announcements[1]._id, title: 'New: Updated Health Insurance Benefits', message: 'Updated 2026 health insurance package.', type: 'in_app', status: 'sent', sentAt: pastDate(2) },
    { userId: employee._id, announcementId: announcements[2]._id, title: 'New: Engineering Sprint Planning', message: 'CI/CD Pipeline migration details.', type: 'in_app', status: 'read', sentAt: pastDate(1), readAt: now },
  ]);
  console.log(`✅ Notifications: 3 created`);

  console.log('\n🎉 Seed complete!\n');
  console.log('   Admin Login:    admin@acme.com / admin123');
  console.log('   Employee Login: employee@acme.com / employee123\n');

  process.exit(0);
};

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });
