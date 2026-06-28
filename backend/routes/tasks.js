const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getStats
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All task routes require authentication
router.use(protect);

const taskValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'completed'])
    .withMessage('Invalid status value'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority value'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Invalid date format'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
];

router.get('/stats', getStats);
router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', taskValidation, createTask);
router.put('/:id', taskValidation, updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
