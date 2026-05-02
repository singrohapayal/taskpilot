const prisma = require('../lib/prisma');

// GET /api/projects
const getProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      include: {
        project: {
          include: {
            owner: { select: { id: true, name: true, email: true } },
            members: {
              include: { user: { select: { id: true, name: true, email: true } } },
            },
            _count: { select: { tasks: true } },
          },
        },
      },
      orderBy: { project: { createdAt: 'desc' } },
    });

    const projects = memberships.map((m) => ({
      ...m.project,
      myRole: m.role,
    }));

    res.json({ projects });
  } catch (err) {
    next(err);
  }
};

// POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: userId,
        members: {
          create: { userId, role: 'ADMIN' },
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        _count: { select: { tasks: true } },
      },
    });

    res.status(201).json({ message: 'Project created.', project: { ...project, myRole: 'ADMIN' } });
  } catch (err) {
    next(err);
  }
};

// GET /api/projects/:id
const getProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { joinedAt: 'asc' },
        },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
            createdBy: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) return res.status(404).json({ message: 'Project not found.' });

    const membership = project.members.find((m) => m.userId === userId);
    if (!membership) return res.status(403).json({ message: 'Access denied.' });

    res.json({ project: { ...project, myRole: membership.role } });
  } catch (err) {
    next(err);
  }
};

// PUT /api/projects/:id
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const project = await prisma.project.update({
      where: { id },
      data: { name, description },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { tasks: true } },
      },
    });

    res.json({ message: 'Project updated.', project });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/projects/:id
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Only the owner can delete the project
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    if (project.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Only the project owner can delete it.' });
    }

    await prisma.project.delete({ where: { id } });
    res.json({ message: 'Project deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/projects/:id/members
const addMember = async (req, res, next) => {
  try {
    const { id: projectId } = req.params;
    const { email, role = 'MEMBER' } = req.body;

    const userToAdd = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (!userToAdd) {
      return res.status(404).json({ message: 'No user found with that email address.' });
    }

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: userToAdd.id } },
    });

    if (existing) {
      return res.status(409).json({ message: 'User is already a member of this project.' });
    }

    const membership = await prisma.projectMember.create({
      data: { projectId, userId: userToAdd.id, role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.status(201).json({ message: 'Member added.', membership });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/projects/:id/members/:userId
const removeMember = async (req, res, next) => {
  try {
    const { id: projectId, userId } = req.params;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (project.ownerId === userId) {
      return res.status(400).json({ message: 'Cannot remove the project owner.' });
    }

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
    });

    res.json({ message: 'Member removed.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProjects, createProject, getProject, updateProject, deleteProject, addMember, removeMember };
