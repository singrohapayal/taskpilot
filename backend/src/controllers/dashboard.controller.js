const prisma = require('../lib/prisma');

// GET /api/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Get all project IDs the user belongs to
    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true, role: true },
    });

    const projectIds = memberships.map((m) => m.projectId);

    // My assigned tasks
    const myTasks = await prisma.task.findMany({
      where: { assigneeId: userId },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    // All tasks across my projects (for stats)
    const allProjectTasks = await prisma.task.findMany({
      where: { projectId: { in: projectIds } },
      select: { id: true, status: true, priority: true, dueDate: true, projectId: true },
    });

    // Status breakdown
    const statusCounts = {
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 0,
    };
    allProjectTasks.forEach((t) => {
      statusCounts[t.status]++;
    });

    // Priority breakdown
    const priorityCounts = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
    };
    allProjectTasks.forEach((t) => {
      priorityCounts[t.priority]++;
    });

    // Overdue tasks (assigned to me, not done, past due)
    const overdueTasks = myTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE'
    );

    // Tasks per project
    const projectTaskCounts = {};
    allProjectTasks.forEach((t) => {
      projectTaskCounts[t.projectId] = (projectTaskCounts[t.projectId] || 0) + 1;
    });

    const projectsWithCounts = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      select: { id: true, name: true },
    });

    const tasksPerProject = projectsWithCounts.map((p) => ({
      projectId: p.id,
      projectName: p.name,
      taskCount: projectTaskCounts[p.id] || 0,
    }));

    // Recent tasks (last 5 created in my projects)
    const recentTasks = await prisma.task.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    res.json({
      stats: {
        totalProjects: projectIds.length,
        totalTasks: allProjectTasks.length,
        myTasksCount: myTasks.length,
        overdueCount: overdueTasks.length,
      },
      statusCounts,
      priorityCounts,
      tasksPerProject,
      myTasks: myTasks.slice(0, 10),
      overdueTasks,
      recentTasks,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
