const express = require('express');
const { body } = require('express-validator');
const router = express.Router({ mergeParams: true });

const { getTasks, createTask, getTask, updateTask, deleteTask } = require('../controllers/task.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireProjectMember } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');

router.use(authMiddleware);

// Project-scoped task routes  (/api/projects/:projectId/tasks)
router.get('/', requireProjectMember, getTasks);

router.post(
  '/',
  requireProjectMember,
  [
    body('title').trim().notEmpty().withMessage('Task title is required').isLength({ max: 300 }),
    body('description').optional().trim().isLength({ max: 2000 }),
    body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
    body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid date format'),
    body('assigneeId').optional({ nullable: true }).isString(),
  ],
  validate,
  createTask
);

module.exports = router;
