const { validationResult } = require('express-validator');
const Task = require('../models/Task');

// GET /api/tasks — with filtering, sorting, pagination, search
exports.getTasks = async (req, res, next) => {
  try {
    const {
      status,
      priority,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20,
      tags
    } = req.query;

    const filter = { user: req.user._id };

    if (status && status !== 'all') filter.status = status;
    if (priority && priority !== 'all') filter.priority = priority;
    if (tags) filter.tags = { $in: tags.split(',') };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const allowedSort = ['createdAt', 'updatedAt', 'dueDate', 'priority', 'title', 'order'];
    const sortField = sortBy === 'manual' ? 'order' : (allowedSort.includes(sortBy) ? sortBy : 'createdAt');

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Task.countDocuments(filter);
    const tasks = await Task.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: tasks.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      tasks
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/:id
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

// POST /api/tasks
exports.createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { title, description, status, priority, dueDate, tags, order } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null,
      tags: tags || [],
      order: order ?? Date.now(),
      user: req.user._id
    });

    res.status(201).json({ success: true, message: 'Task created!', task });
  } catch (err) {
    next(err);
  }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const { title, description, status, priority, dueDate, tags, order } = req.body;

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.status = status ?? task.status;
    task.priority = priority ?? task.priority;
    task.dueDate = dueDate !== undefined ? (dueDate || null) : task.dueDate;
    task.tags = tags ?? task.tags;
    task.order = order !== undefined ? order : task.order;

    await task.save();

    res.json({ success: true, message: 'Task updated!', task });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    res.json({ success: true, message: 'Task deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/stats
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [statusStats, priorityStats, total, overdueTasks] = await Promise.all([
      Task.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Task.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Task.countDocuments({ user: userId }),
      Task.countDocuments({
        user: userId,
        dueDate: { $lt: new Date() },
        status: { $ne: 'completed' }
      })
    ]);

    const stats = {
      total,
      overdue: overdueTasks,
      byStatus: { todo: 0, 'in-progress': 0, completed: 0 },
      byPriority: { low: 0, medium: 0, high: 0 }
    };

    statusStats.forEach(({ _id, count }) => {
      if (stats.byStatus[_id] !== undefined) stats.byStatus[_id] = count;
    });

    priorityStats.forEach(({ _id, count }) => {
      if (stats.byPriority[_id] !== undefined) stats.byPriority[_id] = count;
    });

    res.json({ success: true, stats });
  } catch (err) {
    next(err);
  }
};
