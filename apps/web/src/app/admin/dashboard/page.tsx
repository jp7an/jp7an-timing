'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { eventsApi, adminApi, setAuthToken } from '@/lib/api';
import { formatDate, getRaceModeName } from '@/lib/utils';
import Link from 'next/link';

interface Event {
  id: string;
  slug: string;
  name: string;
  mode: string;
  date: string;
  isActive: boolean;
  _count: {
    participants: number;
  };
}

export default function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsApi.getAll(true); // Include all events for admin dashboard
      setEvents(response.data);
    } catch (err) {
      setError('Kunde inte ladda evenemang');
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }

    try {
      await adminApi.verify(token);
      loadEvents();
    } catch (err) {
      setAuthToken(null);
      router.push('/admin');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = () => {
    setAuthToken(null);
    router.push('/admin');
  };

  const handleDeleteEvent = async (id: string, name: string) => {
    if (!confirm(`Är du säker på att du vill radera "${name}"?`)) {
      return;
    }

    try {
      await eventsApi.delete(id);
      loadEvents();
    } catch (err) {
      alert('Kunde inte radera evenemang');
    }
  };

  if (loading) {
    return (
      <main className="container" style={{ padding: '2rem 1rem' }}>
        <div className="text-center">
          <div className="loading"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: '2rem 1rem' }}>
      <div className="flex items-center justify-between mb-4">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="btn btn-outline">
          Logga ut
        </button>
      </div>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      <div className="card mb-3">
        <h2 className="mb-2">Snabbåtgärder</h2>
        <div className="flex gap-2">
          <Link href="/admin/events/new" className="btn btn-primary">
            Nytt evenemang
          </Link>
          <Link href="/admin/participants" className="btn btn-secondary">
            Hantera deltagare
          </Link>
          <Link href="/chiputlamning" className="btn btn-secondary">
            Chiputlämning
          </Link>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-3">Evenemang</h2>
        
        {events.length === 0 ? (
          <p>Inga evenemang skapade ännu.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Namn</th>
                <th>Datum</th>
                <th>Läge</th>
                <th>Deltagare</th>
                <th>Status</th>
                <th>Åtgärder</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td><strong>{event.name}</strong></td>
                  <td>{formatDate(event.date)}</td>
                  <td>{getRaceModeName(event.mode)}</td>
                  <td>{event._count.participants}</td>
                  <td>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '0.25rem',
                      backgroundColor: event.isActive ? 'var(--color-success)' : 'var(--color-gray-medium)',
                      color: 'white',
                      fontSize: '0.875rem'
                    }}>
                      {event.isActive ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <Link 
                        href={`/admin/events/${event.id}`}
                        className="btn btn-outline"
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        Redigera
                      </Link>
                      <Link 
                        href={`/live/${event.slug}`}
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        Live
                      </Link>
                      <button
                        onClick={() => handleDeleteEvent(event.id, event.name)}
                        className="btn btn-outline"
                        style={{ padding: '0.5rem 1rem', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                      >
                        Radera
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
