const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { getTask, updateTask, deleteTask } = require('../controllers/task.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

router.use(authMiddleware);

router.get('/:id', getTask);

router.put(
  '/:id',
  [
    body('title').optional().trim().notEmpty().isLength({ max: 300 }),
    body('description').optional().trim().isLength({ max: 2000 }),
    body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
    body('dueDate').optional({ nullable: true }).isISO8601(),
    body('assigneeId').optional({ nullable: true }).isString(),
  ],
  validate,
  updateTask
);

router.delete('/:id', deleteTask);

module.exports = router;
