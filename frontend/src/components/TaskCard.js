import React from 'react';
import { format, parseISO, differenceInCalendarDays, isToday } from 'date-fns';

const priorityLabel = { high: '🔥 HIGH', medium: '⚡ MEDIUM', low: '🌿 LOW' };
const statusLabel = { todo: 'To Do', 'in-progress': 'In Progress', completed: 'Completed' };
const statusProgress = { todo: 22, 'in-progress': 68, completed: 100 };

const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  draggable = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragging = false,
}) => {
  const parsedDue = task.dueDate ? parseISO(task.dueDate) : null;
  const created = task.createdAt ? parseISO(task.createdAt) : null;
  const updated = task.updatedAt ? parseISO(task.updatedAt) : null;
  const isCompleted = task.status === 'completed';
  const dueDays = parsedDue ? differenceInCalendarDays(parsedDue, new Date()) : null;

  const dueLabel = parsedDue
    ? isCompleted
      ? `✅ Completed on ${format(parsedDue, 'MMM d, yyyy')}`
      : dueDays < 0
        ? `🔴 Overdue by ${Math.abs(dueDays)} day${Math.abs(dueDays) === 1 ? '' : 's'}`
        : isToday(parsedDue)
          ? '🟢 Due today'
          : dueDays === 1
            ? '🟠 Tomorrow'
            : `🟢 Due in ${dueDays} days`
    : 'No due date';

  const dueClass = parsedDue && !isCompleted
    ? dueDays < 0
      ? 'overdue'
      : isToday(parsedDue)
        ? 'due-today'
        : dueDays === 1
          ? 'due-tomorrow'
          : 'due-upcoming'
    : '';
  const progress = statusProgress[task.status] ?? 0;

  return (
    <div
      className={`task-card priority-${task.priority} ${isCompleted ? 'completed-card' : ''} ${isDragging ? 'dragging' : ''}`}
      draggable={draggable}
      onDragStart={() => onDragStart?.(task._id)}
      onDragEnd={() => onDragEnd?.()}
      onDragOver={(event) => onDragOver?.(event)}
      onDrop={() => onDrop?.(task._id)}
    >
      <div className="task-card-top">
        <span className={`task-chip priority-${task.priority}`}>{priorityLabel[task.priority]}</span>
        <div className="task-top-actions">
          {draggable && <span className="drag-handle" title="Drag to reorder">⋮⋮</span>}
          <span className={`badge badge-${task.status}`}>{statusLabel[task.status]}</span>
        </div>
      </div>

      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <div className="task-actions">
          <button className="btn-icon" onClick={() => onEdit(task)} title="Edit">✏️</button>
          <button className="btn-icon" onClick={() => onDelete(task._id)} title="Delete">🗑️</button>
        </div>
      </div>

      {task.description && <p className="task-desc">{task.description}</p>}

      <div className="task-progress-line">
        <div className="task-progress-fill" style={{ width: `${progress}%` }} />
        <span className="progress-text">{progress}%</span>
      </div>

      <div className="task-meta-row">
        <span className={`due-date ${dueClass}`} title={dueLabel}>{dueLabel}</span>
        <span className="task-time">Created {created ? format(created, 'MMM d') : '—'}</span>
        <span className="task-time">Updated {updated ? format(updated, 'MMM d') : '—'}</span>
      </div>

      {task.tags?.length > 0 && (
        <div className="tags-row">
          {task.tags.map((t) => (
            <span key={t} className="tag">#{t}</span>
          ))}
        </div>
      )}

      <div className="task-footer">
        <select
          className="status-select"
          value={task.status}
          onChange={(e) => onStatusChange(task._id, e.target.value)}
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <span className="created-at">
          {created ? format(created, 'MMM d') : '—'}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;
