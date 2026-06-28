import React, { useState, useEffect } from 'react';

const INIT = { title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', tags: [] };

const validate = (data) => {
  const errs = {};
  if (!data.title.trim()) errs.title = 'Title is required';
  else if (data.title.trim().length < 3) errs.title = 'Title must be at least 3 characters';
  else if (data.title.length > 100) errs.title = 'Title cannot exceed 100 characters';
  if (data.description.length > 500) errs.description = 'Description cannot exceed 500 characters';
  return errs;
};

const TaskModal = ({ task, onClose, onSave }) => {
  const isEditing = !!task?._id;
  const [form, setForm] = useState(INIT);
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        tags: task.tags || [],
      });
    } else {
      setForm(INIT);
    }
  }, [task]);

  const set = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t]);
    setTagInput('');
  };

  const removeTag = (t) => set('tags', form.tags.filter((x) => x !== t));

  const handleSubmit = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      await onSave({
        ...form,
        dueDate: form.dueDate || null,
        title: form.title.trim(),
        description: form.description.trim(),
      });
      onClose();
    } catch {
      // toast already shown in hook
    } finally {
      setSaving(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Task' : 'New Task'}</h2>
          <button className="btn-icon" onClick={onClose} style={{ fontSize: 18 }}>✕</button>
        </div>

        <div className="modal-body">
          {/* Title */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Title *</label>
            <input
              className={`form-input ${errors.title ? 'error' : ''}`}
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
            />
            {errors.title && <div className="form-error">{errors.title}</div>}
          </div>

          {/* Description */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Description</label>
            <textarea
              className={`form-input ${errors.description ? 'error' : ''}`}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Add some details..."
              rows={3}
              style={{ resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {errors.description && <div className="form-error">{errors.description}</div>}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginLeft: 'auto' }}>
                {form.description.length}/500
              </span>
            </div>
          </div>

          {/* Status + Priority */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Status</label>
              <select className="form-input filter-select" style={{ width: '100%' }} value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Priority</label>
              <select className="form-input filter-select" style={{ width: '100%' }} value={form.priority} onChange={(e) => set('priority', e.target.value)}>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Due Date</label>
            <input
              type="date"
              className="form-input"
              value={form.dueDate}
              onChange={(e) => set('dueDate', e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tags</label>
            <div className="tags-input-row">
              <input
                className="form-input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Type tag and press Enter"
                style={{ flex: 1 }}
              />
              <button type="button" className="btn btn-ghost" onClick={addTag} style={{ padding: '8px 14px', whiteSpace: 'nowrap' }}>
                + Add
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="tags-list">
                {form.tags.map((t) => (
                  <span key={t} className="tag-removable" onClick={() => removeTag(t)}>
                    #{t} ✕
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving} style={{ width: 'auto', padding: '10px 24px' }}>
            {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
