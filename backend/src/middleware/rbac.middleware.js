const prisma = require('../lib/prisma');

/**
 * Checks if the authenticated user is an ADMIN in a specific project.
 * Requires: req.user (from authMiddleware) and req.params.id (projectId) OR req.params.projectId
 */
const requireProjectAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId;
    const userId = req.user.id;

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (!membership || membership.role !== 'ADMIN') {
      return res.status(403).json({
        message: 'Access denied. Only project admins can perform this action.',
      });
    }

    req.membership = membership;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Checks if the authenticated user is a member (any role) of a specific project.
 */
const requireProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId;
    const userId = req.user.id;

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (!membership) {
      return res.status(403).json({
        message: 'Access denied. You are not a member of this project.',
      });
    }

    req.membership = membership;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requireProjectAdmin, requireProjectMember };
