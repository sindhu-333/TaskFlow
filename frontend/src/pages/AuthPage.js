import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    const email = form.email.trim();
    const password = form.password;

    if (mode === 'register' && !form.name.trim()) errs.name = 'Name is required';
    if (mode === 'register' && form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';

    if (!email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email like name@example.com';

    if (!password) errs.password = 'Password is required';
    else {
      if (password.length < 8) errs.password = 'Password must be at least 8 characters';
      else if (!/[A-Z]/.test(password)) errs.password = 'Add at least one uppercase letter';
      else if (!/[0-9]/.test(password)) errs.password = 'Add at least one number';
      else if (!/[!@#$%^&*]/.test(password)) errs.password = 'Add at least one special character';
    }

    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        await register(form.name, form.email, form.password);
        toast.success('Account created! Welcome aboard 🎉');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setErrors({});
    setShowPassword(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">✓</div>
          <h1>TaskFlow</h1>
        </div>

        <h2 className="auth-title">{mode === 'login' ? 'Welcome back' : 'Create an account'}</h2>
        <p className="auth-subtitle">
          {mode === 'login' ? 'Sign in to access your tasks' : 'Start organizing your work today'}
        </p>

        {mode === 'register' && (
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className={`form-input ${errors.name ? 'error' : ''}`}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="John Doe"
              autoFocus
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className={`form-input ${errors.email ? 'error' : ''}`}
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="you@example.com"
            autoFocus={mode === 'login'}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          {mode === 'register' && (
            <div className="form-hint">Use a valid address you can access later.</div>
          )}
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="password-input-wrap">
            <input
              className={`form-input ${errors.password ? 'error' : ''}`}
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder={mode === 'register' ? 'Create a strong password' : '••••••••'}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {mode === 'register' && (
            <div className="form-hint">
              Use 8+ chars with an uppercase letter, a number, and a special character.
            </div>
          )}
          {errors.password && <div className="form-error">{errors.password}</div>}
        </div>

        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        <div className="auth-switch">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={switchMode}>{mode === 'login' ? 'Sign up' : 'Sign in'}</button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
