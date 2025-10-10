'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, setAuthToken } from '@/lib/api';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await adminApi.login(password);
      setAuthToken(response.data.token);
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Inloggning misslyckades');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container" style={{ padding: '4rem 1rem', maxWidth: '500px' }}>
      <div className="card">
        <h1 className="text-center mb-3">Admin-inloggning</h1>
        
        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Lösenord
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
          </div>

          <p style={{ color: 'var(--color-gray-dark)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            Du förblir permanent inloggad på denna enhet efter inloggning.
          </p>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Loggar in...' : 'Logga in'}
          </button>
        </form>
      </div>
    </main>
  );
}
