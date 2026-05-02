const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/project.controller');

const authMiddleware = require('../middleware/auth.middleware');
const { requireProjectAdmin, requireProjectMember } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');

router.use(authMiddleware);

router.get('/', getProjects);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Project name is required').isLength({ max: 200 }),
    body('description').optional().trim().isLength({ max: 1000 }),
  ],
  validate,
  createProject
);

router.get('/:id', requireProjectMember, getProject);

router.put(
  '/:id',
  requireProjectAdmin,
  [
    body('name').optional().trim().notEmpty().isLength({ max: 200 }),
    body('description').optional().trim().isLength({ max: 1000 }),
  ],
  validate,
  updateProject
);

router.delete('/:id', requireProjectAdmin, deleteProject);

// Members
router.post(
  '/:id/members',
  requireProjectAdmin,
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('role').optional().isIn(['ADMIN', 'MEMBER']).withMessage('Role must be ADMIN or MEMBER'),
  ],
  validate,
  addMember
);

router.delete('/:id/members/:userId', requireProjectAdmin, removeMember);

module.exports = router;
