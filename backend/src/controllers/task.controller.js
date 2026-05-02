const prisma = require('../lib/prisma');

// GET /api/projects/:projectId/tasks
const getTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assigneeId } = req.query;

    const where = { projectId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });

    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

// POST /api/projects/:projectId/tasks
const createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, dueDate, assigneeId } = req.body;

    // Validate assignee is a project member if provided
    if (assigneeId) {
      const isMember = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: assigneeId } },
      });
      if (!isMember) {
        return res.status(400).json({ message: 'Assignee must be a member of this project.' });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId: assigneeId || null,
        createdById: req.user.id,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({ message: 'Task created.', task });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/:id
const getTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });

    if (!task) return res.status(404).json({ message: 'Task not found.' });

    // verify user is a project member
    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId } },
    });
    if (!membership) return res.status(403).json({ message: 'Access denied.' });

    res.json({ task });
  } catch (err) {
    next(err);
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId } },
    });
    if (!membership) return res.status(403).json({ message: 'Access denied.' });

    const { title, description, status, priority, dueDate, assigneeId } = req.body;

    let updateData = {};

    if (membership.role === 'ADMIN') {
      // Admins can update everything
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (priority !== undefined) updateData.priority = priority;
      if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
      if (assigneeId !== undefined) {
        if (assigneeId) {
          const isMember = await prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId: task.projectId, userId: assigneeId } },
          });
          if (!isMember) {
            return res.status(400).json({ message: 'Assignee must be a project member.' });
          }
        }
        updateData.assigneeId = assigneeId || null;
      }
    }

    // Both roles can update status
    if (status !== undefined) updateData.status = status;

    const updated = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });

    res.json({ message: 'Task updated.', task: updated });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId } },
    });

    if (!membership || membership.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can delete tasks.' });
    }

    await prisma.task.delete({ where: { id } });
    res.json({ message: 'Task deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, createTask, getTask, updateTask, deleteTask };
