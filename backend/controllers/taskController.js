// controllers/taskController.js

const Task = require('../models/Task');

// GET /api/tasks
const getTasks = async (req, res) => {
  try {
    // ต้องมี auth ตั้งค่า req.user มาก่อน
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthenticated' });

    const tasks = await Task.find({ userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/tasks
const addTask = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthenticated' });

    const { title, description, deadline } = req.body;
    if (!title) return res.status(400).json({ message: 'title is required' });

    const task = await Task.create({ userId, title, description, deadline });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthenticated' });

    const { id } = req.params;
    const { title, description, completed, deadline } = req.body;

    // กรองด้วย userId เพื่อกันแก้ข้อมูลของคนอื่น
    const task = await Task.findOne({ _id: id, userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = completed;
    if (deadline !== undefined) task.deadline = deadline;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthenticated' });

    const { id } = req.params;
    const deleted = await Task.findOneAndDelete({ _id: id, userId });
    if (!deleted) return res.status(404).json({ message: 'Task not found' });

    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTasks, addTask, updateTask, deleteTask };