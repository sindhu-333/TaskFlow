import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { format, isToday, parseISO, startOfDay, subDays, isSameDay, addDays } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../hooks/useTasks';
import Navbar from '../components/Navbar';
import StatsBar from '../components/StatsBar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import ConfirmModal from '../components/ConfirmModal';

const STATUS_TABS = [
  { label: 'All', value: 'all' },
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Completed', value: 'completed' },
];

const Dashboard = () => {
  const { user } = useAuth();

  const readStoredState = (key, fallback) => {
    if (typeof window === 'undefined') return fallback;
    const stored = window.localStorage.getItem(key);
    return stored ?? fallback;
  };

  const [search, setSearch] = useState(() => readStoredState('taskflow.dashboard.search', ''));
  const [statusFilter, setStatusFilter] = useState(() => readStoredState('taskflow.dashboard.status', 'all'));
  const [priorityFilter, setPriorityFilter] = useState(() => readStoredState('taskflow.dashboard.priority', 'all'));
  const [sortBy, setSortBy] = useState(() => readStoredState('taskflow.dashboard.sortBy', 'createdAt'));
  const [order, setOrder] = useState(() => readStoredState('taskflow.dashboard.order', 'desc'));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [displayTasks, setDisplayTasks] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('taskflow.dashboard.search', search);
      window.localStorage.setItem('taskflow.dashboard.status', statusFilter);
      window.localStorage.setItem('taskflow.dashboard.priority', priorityFilter);
      window.localStorage.setItem('taskflow.dashboard.sortBy', sortBy);
      window.localStorage.setItem('taskflow.dashboard.order', order);
    }
  }, [search, statusFilter, priorityFilter, sortBy, order]);

  const filters = useMemo(() => ({
    ...(search ? { search } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
    ...(priorityFilter !== 'all' ? { priority: priorityFilter } : {}),
    sortBy: sortBy === 'manual' ? 'manual' : sortBy,
    order: sortBy === 'manual' ? 'asc' : order,
    limit: 50,
  }), [search, statusFilter, priorityFilter, sortBy, order]);

  const { tasks, stats, loading, createTask, updateTask, deleteTask } = useTasks(filters);

  useEffect(() => {
    setDisplayTasks(tasks);
  }, [tasks]);

  const completed = stats?.byStatus?.completed ?? 0;
  const total = stats?.total ?? tasks.length;
  const pending = Math.max(total - completed, 0);
  const progressPercent = total ? Math.round((completed / total) * 100) : 0;

  const dueToday = useMemo(() => tasks.filter((task) => {
    if (!task.dueDate || task.status === 'completed') return false;
    return isToday(parseISO(task.dueDate));
  }).length, [tasks]);

  const dueSoon = useMemo(() => tasks.filter((task) => {
    if (!task.dueDate || task.status === 'completed') return false;
    const due = parseISO(task.dueDate);
    return due >= new Date() && due <= addDays(new Date(), 3);
  }).length, [tasks]);

  const highPriority = useMemo(() => tasks.filter((task) => task.priority === 'high' && task.status !== 'completed').length, [tasks]);
  const completedToday = useMemo(() => tasks.filter((task) => task.status === 'completed' && task.completedAt && isSameDay(parseISO(task.completedAt), new Date())).length, [tasks]);

  const dueTodayLabel = dueToday === 0 ? 'No tasks due today' : `${dueToday} task${dueToday === 1 ? '' : 's'} due today`;

  const weeklyData = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: 7 }, (_, index) => {
      const day = subDays(today, 6 - index);
      const count = tasks.reduce((totalCount, task) => {
        if (!task.createdAt) return totalCount;
        return isSameDay(parseISO(task.createdAt), day) ? totalCount + 1 : totalCount;
      }, 0);
      return { label: format(day, 'EEE'), count };
    });
  }, [tasks]);

  const statusBreakdown = useMemo(() => [
    { label: 'To Do', value: stats?.byStatus?.todo ?? 0, color: 'rgba(34,211,238,0.85)' },
    { label: 'In Progress', value: stats?.byStatus?.['in-progress'] ?? 0, color: 'rgba(124,90,240,0.85)' },
    { label: 'Completed', value: stats?.byStatus?.completed ?? 0, color: 'rgba(52,211,153,0.85)' },
  ], [stats]);

  const pieBackground = useMemo(() => {
    const p1 = statusBreakdown[0]?.value ?? 0;
    const p2 = statusBreakdown[1]?.value ?? 0;
    const p3 = statusBreakdown[2]?.value ?? 0;
    const totalSegments = Math.max(p1 + p2 + p3, 1);
    const angle1 = (p1 / totalSegments) * 360;
    const angle2 = (p2 / totalSegments) * 360;
    return `conic-gradient(${statusBreakdown[0].color} 0deg, ${statusBreakdown[0].color} ${angle1}deg, ${statusBreakdown[1].color} ${angle1}deg, ${statusBreakdown[1].color} ${angle1 + angle2}deg, ${statusBreakdown[2].color} ${angle1 + angle2}deg, ${statusBreakdown[2].color} 360deg)`;
  }, [statusBreakdown]);

  const openCreate = () => { setEditingTask(null); setModalOpen(true); };
  const openEdit = (task) => { setEditingTask(task); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingTask(null); };

  const handleSave = useCallback(async (data) => {
    if (editingTask?._id) {
      await updateTask(editingTask._id, data);
    } else {
      await createTask(data);
    }
  }, [editingTask, updateTask, createTask]);

  const handleDelete = useCallback((id) => {
    setConfirmDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!confirmDeleteId) return;
    await deleteTask(confirmDeleteId);
    setConfirmDeleteId(null);
  }, [confirmDeleteId, deleteTask]);

  const cancelDelete = useCallback(() => setConfirmDeleteId(null), []);

  const handleStatusChange = useCallback(async (id, status) => {
    const task = tasks.find((t) => t._id === id);
    if (task) await updateTask(id, { ...task, status });
  }, [tasks, updateTask]);

  const handleDragStart = useCallback((id) => {
    setDraggedTaskId(id);
  }, []);

  const handleDrop = useCallback(async (targetId) => {
    if (!draggedTaskId || draggedTaskId === targetId) return;

    const sourceIndex = displayTasks.findIndex((task) => task._id === draggedTaskId);
    const targetIndex = displayTasks.findIndex((task) => task._id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const updated = [...displayTasks];
    const [moved] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, moved);
    setDisplayTasks(updated);

    const reordered = updated.map((task, index) => ({ ...task, order: index * 1000 + 1000 }));
    setDisplayTasks(reordered);

    await Promise.all(reordered.map((task) => updateTask(task._id, { order: task.order }, { silent: true })));
    setDraggedTaskId(null);
  }, [displayTasks, draggedTaskId, updateTask]);

  const handleDragEnd = useCallback(() => {
    setDraggedTaskId(null);
  }, []);

  const tabCounts = useMemo(() => ({
    all: stats?.total ?? 0,
    todo: stats?.byStatus?.todo ?? 0,
    'in-progress': stats?.byStatus?.['in-progress'] ?? 0,
    completed: stats?.byStatus?.completed ?? 0,
  }), [stats]);

  const skeletonCards = Array.from({ length: 6 }).map((_, index) => (
    <div key={index} className="skeleton-card">
      <div className="skeleton-line short" />
      <div className="skeleton-line medium" />
      <div className="skeleton-line long" />
      <div className="skeleton-line tiny" />
    </div>
  ));

  return (
    <div className="app-layout">
      <Navbar />

      <main className="app-main">
        <section className="dashboard-hero">
          <div className="hero-copy">
            <span className="hero-badge">Premium Dashboard</span>
            <h1>☀ Good {getGreeting()}, {user?.name?.split(' ')[0]}</h1>
            <p>{`Have a productive day. ${dueTodayLabel}.`}</p>
            <div className="hero-pill-row">
              <div className="hero-pill">
                <span>Completed</span>
                <strong>{completed}</strong>
              </div>
              <div className="hero-pill">
                <span>Pending</span>
                <strong>{pending}</strong>
              </div>
              <div className="hero-pill">
                <span>Overdue</span>
                <strong>{stats?.overdue ?? 0}</strong>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-progress-card">
              <div className="hero-progress-header">
                <p>Today's Progress</p>
                <strong>{progressPercent}%</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="hero-progress-meta">
                <span>{completed} completed</span>
                <span>{total} total</span>
              </div>
            </div>
          </div>
        </section>

        <StatsBar stats={stats} />

        <section className="dashboard-analytics">
          <div className="analytics-card chart-card">
            <div className="analytics-head">
              <h3>Weekly Activity</h3>
              <span>Created tasks from the last 7 days</span>
            </div>
            <div className="weekly-chart">
              {weeklyData.map((item) => (
                <div key={item.label} className="weekly-column">
                  <div className="weekly-bar" style={{ height: `${Math.max(item.count * 14, 18)}px` }} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="analytics-card pie-card">
            <div className="analytics-head">
              <h3>Task Distribution</h3>
              <span>Status breakdown</span>
            </div>
            <div className="pie-legend">
              {statusBreakdown.map((item) => (
                <div key={item.label} className="legend-row">
                  <span className="legend-dot" style={{ background: item.color }} />
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
            <div className="pie-chart" style={{ background: pieBackground }}>
              <div className="pie-center">{progressPercent}%</div>
            </div>
          </div>
        </section>

        <section className="focus-grid">
          <div className="analytics-card focus-card">
            <div className="analytics-head">
              <h3>Due Soon</h3>
              <span>Next 3 days</span>
            </div>
            <div className="focus-metric">
              <strong>{dueSoon}</strong>
              <span>tasks need attention</span>
            </div>
          </div>
          <div className="analytics-card focus-card">
            <div className="analytics-head">
              <h3>Priority Focus</h3>
              <span>High urgency items</span>
            </div>
            <div className="focus-metric">
              <strong>{highPriority}</strong>
              <span>high-priority tasks</span>
            </div>
          </div>
          <div className="analytics-card focus-card">
            <div className="analytics-head">
              <h3>Completed Today</h3>
              <span>Finished this day</span>
            </div>
            <div className="focus-metric">
              <strong>{completedToday}</strong>
              <span>tasks wrapped up</span>
            </div>
          </div>
        </section>

        <div className="toolbar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
            />
          </div>

          <div className="filter-group">
            <select className="filter-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="all">All Priorities</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>

            <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="createdAt">Sort: Newest</option>
              <option value="dueDate">Sort: Due Date</option>
              <option value="priority">Sort: Priority</option>
              <option value="title">Sort: A–Z</option>
              <option value="manual">Sort: Manual</option>
            </select>

            <select className="filter-select" value={order} onChange={(e) => setOrder(e.target.value)}>
              <option value="desc">↓ Desc</option>
              <option value="asc">↑ Asc</option>
            </select>
          </div>

          <div className="toolbar-meta">
            {sortBy === 'manual' ? 'Drag cards to reorder' : 'Use Manual to reorder'}
          </div>

          <button className="btn-add" onClick={openCreate}>
            + New Task
          </button>
        </div>

        <div className="status-tabs">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              className={`status-tab ${statusFilter === tab.value ? 'active' : ''}`}
              onClick={() => setStatusFilter(tab.value)}
            >
              {tab.label}
              <span className="tab-count">{tabCounts[tab.value]}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="skeleton-grid">{skeletonCards}</div>
        ) : displayTasks.length === 0 ? (
          <div className="empty-state empty-state-premium">
            <div className="empty-icon">{search || statusFilter !== 'all' ? '🔍' : '📋'}</div>
            <h3>{search || statusFilter !== 'all' ? 'No tasks found' : 'Nothing here yet'}</h3>
            <p>
              {search || statusFilter !== 'all'
                ? 'Try adjusting your filters to find a task.'
                : 'Create your first task to get started with TaskFlow Pro.'}
            </p>
            {!search && statusFilter === 'all' && (
              <button className="btn-add" onClick={openCreate}>+ Add Task</button>
            )}
          </div>
        ) : (
          <div className={`tasks-grid ${sortBy === 'manual' ? 'drag-active' : ''}`}>
            {displayTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={openEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                draggable={sortBy === 'manual'}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(task._id)}
                isDragging={draggedTaskId === task._id}
              />
            ))}
          </div>
        )}
      </main>

      {modalOpen && (
        <TaskModal
          task={editingTask}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}

      <ConfirmModal
        open={Boolean(confirmDeleteId)}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmLabel="Delete"
      />
    </div>
  );
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
};

export default Dashboard;
