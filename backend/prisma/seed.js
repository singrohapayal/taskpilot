const prisma = require('../src/lib/prisma');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('🌱 Seeding database...');

  // Create demo users
  const adminPass = await bcrypt.hash('Admin@123', 12);
  const memberPass = await bcrypt.hash('Member@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@taskpilot.dev' },
    update: {},
    create: { name: 'Alice Admin', email: 'admin@taskpilot.dev', password: adminPass },
  });

  const member = await prisma.user.upsert({
    where: { email: 'member@taskpilot.dev' },
    update: {},
    create: { name: 'Bob Member', email: 'member@taskpilot.dev', password: memberPass },
  });

  // Create demo project
  const project = await prisma.project.upsert({
    where: { id: 'demo-project-001' },
    update: {},
    create: {
      id: 'demo-project-001',
      name: 'Product Launch 2025',
      description: 'Our flagship product launch campaign with all tasks and milestones tracked.',
      ownerId: admin.id,
      members: {
        createMany: {
          data: [
            { userId: admin.id, role: 'ADMIN' },
            { userId: member.id, role: 'MEMBER' },
          ],
          skipDuplicates: true,
        },
      },
    },
  });

  // Create demo tasks
  const tasks = [
    { title: 'Design landing page mockups', status: 'DONE', priority: 'HIGH', assigneeId: member.id, dueDate: new Date('2025-04-01') },
    { title: 'Set up CI/CD pipeline', status: 'DONE', priority: 'MEDIUM', assigneeId: admin.id, dueDate: new Date('2025-04-10') },
    { title: 'Write API documentation', status: 'IN_PROGRESS', priority: 'MEDIUM', assigneeId: member.id, dueDate: new Date('2025-05-15') },
    { title: 'Implement authentication module', status: 'IN_PROGRESS', priority: 'HIGH', assigneeId: admin.id, dueDate: new Date('2025-05-20') },
    { title: 'User acceptance testing', status: 'TODO', priority: 'HIGH', assigneeId: member.id, dueDate: new Date('2025-06-01') },
    { title: 'Performance optimization', status: 'TODO', priority: 'LOW', assigneeId: null, dueDate: new Date('2025-06-15') },
    { title: 'Deploy to production', status: 'TODO', priority: 'HIGH', assigneeId: admin.id, dueDate: new Date('2025-06-30') },
  ];

  for (const t of tasks) {
    await prisma.task.create({
      data: { ...t, projectId: project.id, createdById: admin.id },
    });
  }

  console.log('✅ Seeding complete!');
  console.log('   Admin: admin@taskpilot.dev / Admin@123');
  console.log('   Member: member@taskpilot.dev / Member@123');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
