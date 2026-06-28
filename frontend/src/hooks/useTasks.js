import { useState, useEffect, useCallback } from 'react';
import { taskAPI } from '../utils/api';
import toast from 'react-hot-toast';

export const useTasks = (filters) => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksRes, statsRes] = await Promise.all([
        taskAPI.getAll(filters),
        taskAPI.getStats(),
      ]);
      setTasks(tasksRes.data.tasks);
      setTotal(tasksRes.data.total);
      setStats(statsRes.data.stats);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (data) => {
    try {
      const res = await taskAPI.create(data);
      toast.success('Task created!');
      await fetchTasks();
      return res.data.task;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
      throw err;
    }
  };

  const updateTask = async (id, data, options = {}) => {
    try {
      const { silent = false } = options;
      const res = await taskAPI.update(id, data);
      setTasks((prev) => prev.map((t) => (t._id === id ? res.data.task : t)));
      await taskAPI.getStats().then((r) => setStats(r.data.stats));
      if (!silent) toast.success('Task updated!');
      return res.data.task;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
      throw err;
    }
  };

  const deleteTask = async (id) => {
    try {
      await taskAPI.delete(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      setTotal((t) => t - 1);
      await taskAPI.getStats().then((r) => setStats(r.data.stats));
      toast.success('Task deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
      throw err;
    }
  };

  return { tasks, stats, loading, total, createTask, updateTask, deleteTask, refetch: fetchTasks };
};
